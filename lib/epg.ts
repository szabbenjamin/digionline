/**
 * Ezt nem volt kedvem újraírni.
 * Majd talán egyszer ha ez is lehal :>
 *
 * Created by Ben
 * https://github.com/szabbenjamin/digionline
 */
import Common from "./common";
import CONFIG from "../config";
import {ChannelInterface} from "./digionline";
import Log from "./log";
import FileHandler from "./file";
import Config from "./config";

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM(`<!DOCTYPE html>`);
const $ = require('jquery')(window);
var request = require('request');
var request = request.defaults({jar: true});
const fs = require('fs');

/**
 * Olvasnivalók:
 * https://en.wikipedia.org/wiki/Electronic_program_guide
 * http://kodi.wiki/view/Add-on:IPTV_Simple_Client
 *
 */
class Epg {
    private channelEpgUrls : object = {};
    private channelTemplate : string;
    private programmeTemplate : string;
    private xmlContainer : string;
    private collectedChannels : Array<ChannelInterface> = [];


    constructor () {
        this.channelEpgUrls = FileHandler.readJsonFile('helpers/epg_channel_urls.json') as Object;

        /*
         * Template fájlok az xml generálásához
         */
        this.channelTemplate = '<channel id="id:id"><display-name lang="hu">:channelName</display-name></channel>\n';
        this.programmeTemplate = '<programme start=":start :startOffset" stop=":end :endOffset" channel="id:id"><title lang="hu">:programme</title></programme>\n';
        this.xmlContainer = '<?xml version="1.0" encoding="utf-8" ?><tv>:content</tv>';

        Log.write(`EPG lista típusa: ${this.getEpgType()}`);
    }

    /**
     * Hack arra, hogy ne csak a heti hanem napi EPG listát is le lehessen tölteni
     * @param epgUrl
     */
    private modifyEpgType(epgUrl : string) : string {
        if (this.getEpgType() === 'mai') {
            return epgUrl.replace('heti', 'mai');
        }
        return epgUrl;
    }

    private getEpgType() : string {
        if (typeof Config.instance().epg.type !== 'undefined') {
            if (Config.instance().epg.type === 'mai') {
                return 'mai';
            }
        }
        return 'heti';
    }

    public setChannels (channelList : Array<ChannelInterface>) : void {
        this.collectedChannels = channelList;
    }

    private getChannelEpgUrls () {
        return this.channelEpgUrls;
    }

    private getXmlContainer (content) {
        return this.xmlContainer
            .replace(':content', content);
    }

    private getChannelEpg (id, channelName) {
        var channel = this.channelTemplate
            .replace(':id', id)
            .replace(':channelName', this.escapeXml(channelName));

        return channel;
    }

    private _applyTimeZoneCorrection (originalDate) {
        let correctDate = new Date(originalDate);

        // időzóna korrekció
        const offset = Common.getStaticTimeZoneOffset();
        correctDate.setHours(correctDate.getHours() - offset);

        return correctDate;
    }

    private getProgrammeTemplate (id, start, end, programme) {
        var startCorrect = this._applyTimeZoneCorrection(start);

        var endCorrect = this._applyTimeZoneCorrection(end);

        // Nem lehet egyszerre egy csatornán egy másodpercben egy csatornának kezdete és vége, így kivontunk belőle 1 mp-et
        endCorrect.setMilliseconds(endCorrect.getMilliseconds() - 1000);

        return this.programmeTemplate
            .replace(':id', id)
            .replace(':start', this.formatDate(startCorrect))
            .replace(':end', this.formatDate(endCorrect))
            .replace(':programme', this.escapeXml(programme))
            .replace(':startOffset', '+0100')
            .replace(':endOffset', '+0100')
            ;
    }

    private formatDate (date) {
        let d = new Date(date);
        let year = d.getFullYear();
        let month = String(d.getMonth()+1);
        let day = String(d.getDate());
        let hour = String(d.getHours());
        let minute = String(d.getMinutes());
        let second = String(d.getSeconds());

        if (month.length == 1) {
            month = '0' + month;
        }
        if (day.length == 1) {
            day = '0'+day;
        }
        if (hour.length == 1) {
            hour = '0'+hour;
        }
        if (minute.length == 1) {
            minute = '0'+minute;
        }
        if (second.length == 1) {
            second = '0'+second;
        }

        return '' + year+month+day+hour+minute+second;
    }

    // https://stackoverflow.com/questions/7918868/how-to-escape-xml-entities-in-javascript
    private escapeXml(unsafestr: string) {
        return unsafestr.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            }
        });
    }

    /**
     * Műsorok letöltése
     * @param epgUrl
     * @param cb
     */
    private loadEPG(epgUrl, cb) {
        let headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36',
            'Content-Type' : 'application/x-www-form-urlencoded'
        };

        let shows = [],
            // a későbbi felülírás esetére
            channelEpgUrl = this.modifyEpgType(epgUrl);

        request.get(
            channelEpgUrl,
            {
                headers: headers
            },
            function (error, response, body) {

                $.each($(body).find("section"), function(index, section) {
                    /* A honlap eme "ajánló" elemeit el kell, hogy kerüljük, külünben
                     * tetszőleges csatornákról kerülnének műsorok a listánkra! */
                    let suggestionsToBeIgnored = $(section).find('[class="rotated-text rotated-to-be-seen_internal"]').html();

                    if (typeof suggestionsToBeIgnored === 'undefined') {
                        $.each($(section).find('[itemtype="https://schema.org/BroadcastEvent"]'), function (index, program) {
                            let show = {
                                startDate: $(program).find('[itemprop="startDate"]').attr('content'),
                                name: $(program).find('[itemprop="name"] a').html(),
                                description: $(program).find('[itemprop="description"]').html()
                            };
                            show.toString = function() {
                                return "['" + show.startDate + "' '" + show.name + "' '" + show.description + "']";
                            };

                            /**
                             * duplikációk megszüntetése
                             */
                            for (let i = 0; i < shows.length; i++) {
                                let _startDate = shows[i].startDate;
                                if (_startDate === show.startDate) {
                                    return;
                                }
                            }

                            shows.push(show);
                        });
                    }
                });

                // Rendezés
                shows.sort(function (a, b) {
                    a = new Date(a.startDate);
                    b = new Date(b.startDate);
                    return a < b ? -1 : a > b ? 1 : 0;
                });

                cb(shows);
            });
    }

    /**
     * Elektronikus programujságot generálunk
     */
    public generateEpg() {
        const self = this;
        let epgChannels = '',
            epgPrograms = '',
            epgTimestampPath = './epg.timestamp',
            epgUrls     = this.getChannelEpgUrls();

        let lastUpgrade;
        try {
            lastUpgrade = new Date(fs.readFileSync(epgTimestampPath).toString());
        } catch (e) {
            lastUpgrade = new Date('2000-01-01');
        }

        // XML outdate idő órában számítva
        const diffTime = Config.instance().epg.timeout * 60 * 60;

        if (Config.instance().epg.forceUpdate) {
            Log.write('EPG kenyszeritett ujratoltese...');
        } else if (Common.diffTime(new Date(), lastUpgrade) < diffTime) {
            Log.write('EPG naprakesz');
            return;
        } else {
            Log.write('EPG ujratoltese...');
        }
        FileHandler.writeFile('./epg.xml', '');

        /**
         * XML legyártása
         */
        const writeXml = () => {
            let content = this.getXmlContainer(epgChannels + epgPrograms);
            fs.writeFileSync('./epg.xml', content);
            Log.write('epg.xml ujrairva');
        };

        let channel_list_temp = self.collectedChannels.slice(0);
        let progress = setInterval(() => {
            // Ha elfogyott vége a dalnak, mentjük az xml-t
            if (channel_list_temp.length === 0) {
                clearInterval(progress);
                writeXml();
                fs.writeFileSync(epgTimestampPath, (new Date()).toString());
                return;
            }

            let channelElement  = channel_list_temp.pop(),
                channelIndex    = channelElement.id,
                name            = channelElement.name,
                id              = `id${channelElement.id}`;

            Log.write(`EPG betoltese: ${name}...`)
            if (typeof epgUrls[id] !== 'undefined') {
                epgChannels += self.getChannelEpg(channelIndex, name);
                self.loadEPG(epgUrls[id], function (shows) {
                    for (let i = 0; i < shows.length; i++) {
                        let endStartDate = new Date(shows[i].startDate);
                        epgPrograms += self.getProgrammeTemplate(
                            channelIndex,
                            shows[i].startDate,
                            typeof shows[i+1] !== 'undefined'
                                ? shows[i+1].startDate : endStartDate.setHours(endStartDate.getHours() + 1),
                            shows[i].name + ' ' + shows[i].description
                        );
                    }
                });
            }
        }, (this.getEpgType() === 'mai' ? 1 : 4) * 1000);



        /**
         * XML újragyártása beállított időközönként
         */
        setTimeout(function () {
            Log.write('XML ujragyartasa...');
            self.generateEpg();
        }, Config.instance().epg.timeout * 60 * 60 * 1000);
    }
}

export default Epg;
