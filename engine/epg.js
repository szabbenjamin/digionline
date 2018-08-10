/**
 * Created by Ben
 * https://github.com/szabbenjamin/digionline
 */

var jsdom = require("jsdom");
var $ = require("jquery")(jsdom.jsdom().defaultView);
var request = require('request');
var request = request.defaults({jar: true});
const readlineSync = require('readline-sync');
const fs = require('fs');
const exec = require('child_process').exec;
var log = require('./log.js');

/**
 * Olvasnivalók:
 * https://en.wikipedia.org/wiki/Electronic_program_guide
 * http://kodi.wiki/view/Add-on:IPTV_Simple_Client
 */
class Epg {
    constructor () {
        this.channelEpgUrls = {
            id40: 'https://musor.tv/heti/tvmusor/M2',
            id39: 'https://musor.tv/heti/tvmusor/M1',
            id43: 'https://musor.tv/heti/tvmusor/DUNA',
            id41: 'https://musor.tv/heti/tvmusor/M4_SPORT',
            id44: 'https://musor.tv/heti/tvmusor/DUNAWORLD',
            id132: 'https://musor.tv/heti/tvmusor/M5',
            id207: 'https://musor.tv/heti/tvmusor/NICKELODEON',
            id206: 'https://musor.tv/heti/tvmusor/FEM3',
            id208: 'https://musor.tv/heti/tvmusor/SUPERTV2',
            id10: 'https://musor.tv/heti/tvmusor/COMEDY',
            id34: 'https://musor.tv/heti/tvmusor/COOL',
            id32: 'https://musor.tv/heti/tvmusor/FILMPLUS',
            id220: 'https://musor.tv/heti/tvmusor/NATGEO',
            id29: 'https://musor.tv/heti/tvmusor/RTL2',
            id37: 'https://musor.tv/heti/tvmusor/RTL',
            id204: 'https://musor.tv/heti/tvmusor/TV2',
            id2: 'https://musor.tv/heti/tvmusor/HIT_MUSIC',
            id212: 'https://musor.tv/heti/tvmusor/IZAURA_TV',
            id222: 'https://musor.tv/heti/tvmusor/NATGEOWILD',
            id45: 'https://musor.tv/heti/tvmusor/VIASATHIST',
            id21: 'https://musor.tv/heti/tvmusor/VIASATNAT',
            id7: 'https://musor.tv/heti/tvmusor/DIGIANIMALWORLD',
            id35: 'https://musor.tv/heti/tvmusor/PARAMOUNT',
            id225: 'https://musor.tv/heti/tvmusor/PRIME',
            id12: 'https://musor.tv/heti/tvmusor/DIGILIFE',
            id130: 'https://musor.tv/heti/tvmusor/SPEKTRUM',
            id232: 'https://musor.tv/heti/tvmusor/FILMNOW',
            id1: 'https://musor.tv/heti/tvmusor/DIGIWORLD',
            id219: 'https://musor.tv/heti/tvmusor/RTL_SPIKE',
            id215: 'https://musor.tv/heti/tvmusor/TLC',
            id26: 'https://musor.tv/heti/tvmusor/DIGISPORT1',
            id27: 'https://musor.tv/heti/tvmusor/DIGISPORT2',
            id131: 'https://musor.tv/heti/tvmusor/DIGISPORT3',
            id205: 'https://musor.tv/heti/tvmusor/EUROSPORT',
            id4: 'https://musor.tv/heti/tvmusor/VIASATHIST',
            id211: 'https://musor.tv/heti/tvmusor/HUMOR_PLUSZ',
            id210: 'https://musor.tv/heti/tvmusor/EUROSPORT2',
            id227: 'https://musor.tv/heti/tvmusor/LICHI_TV',
            id23: 'https://musor.tv/heti/tvmusor/PAPRIKA',
            id42: 'https://musor.tv/heti/tvmusor/AMC',
            id216: 'https://musor.tv/heti/tvmusor/ZENEBUTIK',
            id217: 'https://musor.tv/heti/tvmusor/MTV_EURO',
            id213: 'https://musor.tv/heti/tvmusor/KIWI_TV',
            id214: 'https://musor.tv/heti/tvmusor/MOZI_PLUSZ',
            id203: 'https://musor.tv/heti/tvmusor/DISCOVERY',
            id118: 'https://musor.tv/heti/tvmusor/SPORT2',
            id126: 'https://musor.tv/heti/tvmusor/SPORT1',
            id5: 'https://musor.tv/heti/tvmusor/MUSICCHANNEL',
            id226: 'https://musor.tv/heti/tvmusor/MINIMAX',

        };

        /*
         * Template fájlok az xml generálásához
         */
        this.channelTemplate = '<channel id="id:id"><display-name lang="hu">:channelName</display-name></channel>';
        this.programmeTemplate = '<programme start=":start +0100" stop=":end +0100" channel="id:id"><title lang="hu">:programme</title></programme>';
        this.xmlContainer = '<?xml version="1.0" encoding="utf-8" ?><tv>:content</tv>';
    }

    getChannelEpgUrls () {
        return this.channelEpgUrls;
    }

    getXmlContainer (content) {
        return this.xmlContainer
            .replace(':content', content);
    }

    getChannelEpg (id, channelName) {
        var channel = this.channelTemplate
            .replace(':id', id)
            .replace(':channelName', channelName);

        return channel;
    }

    getProgrammeTemplate (id, start, end, programme) {
        var startCorrect = new Date(start);
        // időzóna korrekció
        startCorrect.setHours(startCorrect.getHours() - 3);

        var endCorrect = new Date(end);
        // időzóna korrekció
        endCorrect.setHours(endCorrect.getHours() - 3);

        // Nem lehet egyszerre egy csatornán egy másodpercben egy csatornának kezdete és vége, így kivontunk belőle 1 mp-et
        endCorrect.setMilliseconds(endCorrect.getMilliseconds() - 1000);

        return this.programmeTemplate
            .replace(':id', id)
            .replace(':start', this.formatDate(startCorrect))
            .replace(':end', this.formatDate(endCorrect))
            .replace(':programme', programme);
    }

    formatDate (date) {
        var d       = new Date(date);
        var year    = d.getFullYear();
        var month   = d.getMonth()+1;
        var day     = d.getDate();
        var hour    = d.getHours();
        var minute  = d.getMinutes();
        var second  = d.getSeconds();
        if(month.toString().length == 1) {
            var month = '0'+month;
        }
        if(day.toString().length == 1) {
            var day = '0'+day;
        }
        if(hour.toString().length == 1) {
            var hour = '0'+hour;
        }
        if(minute.toString().length == 1) {
            var minute = '0'+minute;
        }
        if(second.toString().length == 1) {
            var second = '0'+second;
        }

        return '' + year+month+day+hour+minute+second;
    }

    /**
     * Műsorok letöltése
     * @param epgUrl
     * @param cb
     */
    loadEPG(epgUrl, cb) {
        var headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
            'Content-Type' : 'application/x-www-form-urlencoded'
        };

        var shows = [];

        request.get(
            epgUrl,
            {
                headers: headers
            },
            function (error, response, body) {
            var loadedShows = [];

            $.each($(body).find('[itemtype="https://schema.org/BroadcastEvent"]'), function (index, program) {
                var show = {
                    startDate: $(program).find('[itemprop="startDate"]').attr('content'),
                    name: $(program).find('[itemprop="name"] a').html(),
                    description: $(program).find('[itemprop="description"]').html()
                };

                shows.push(show);
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
}

module.exports = Epg;
