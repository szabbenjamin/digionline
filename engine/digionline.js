/**
 * Created by Ben
 * https://github.com/szabbenjamin/digionline
 */

const jsdom = require("jsdom");
const $ = require("jquery")(jsdom.jsdom().defaultView);
let request = require('request');
request = request.defaults({jar: true});
const readlineSync = require('readline-sync');
const fs = require('fs');
const epgClass = require('./epg');
const Epg = new epgClass();
const log = require('./log.js');
const md5 = require('md5');

const config = require('../config.js');

/**
 * Mivel a csatorna megnyitása után általában 12p után a streamelést a szerver biztosan abbahagyja
 * muszáj időnként hellóznunk. A servlet a csatorna megnyitását követően 5 percenként ebben
 * a konstansban megadott alkalommal küld egy üzenetet jelezvén, hogy még nézzük a csatornát.
 * @type {number}
 */
const maxTicking = 45;

/**
 * A konstans a bejelentkezési idővel számol. Ha csatornát próbálunk meg elindítani, de már ezt az
 * időt túlléptük a rendszer újra be fog jelentkeztetni. (default=3h, milliseconds)
 * @type {number}
 */
const loginTimeout = 3 * 60 * 60 * 1000; // 3h

/**
 * Ebben az időpontban történt legutoljára tranzakció
 * @type {number}
 */
let lastUpdate = 0;

class DigiOnline {
    constructor() {
        const self = this;

        // bejelentkezéshez használt token
        this.loginHash;
        // eszköz azonosító token
        this.deviceId;

        // legutóbbi csatorna url-je
        this.lastChannelUrl;

        this.reTryCounter = 0;
        this.tickerCounter = 0;
        this.tickerSession;

        this.collectedChannels = [];
        this.login(function () {
            self.generateChannelList();
        });
    }

    /**
     * Elvégzi a bejelentkezést, lekéri a bejelentkezéshez használt tokent és androidos eszközként regisztrálja servletünket
     * Ha mindez sikeresen megtörtént meghívja a cb-et
     * @param {callback} cb
     * @param {boolean} forceLogin
     */
    login(cb, forceLogin = false) {
        if (!forceLogin) {
            /**
             * Abban az esetben ha a bejelentkezés a loginTimeout-on belül megtörtént
             * nem kísérlünk meg újabb bejelentkezést feleslegesen
             * @type {number}
             */
            const idleTime = (new Date()).getTime() - lastUpdate;
            if (idleTime < loginTimeout) {
                cb();
                return;
            }
        }
        lastUpdate = (new Date()).getTime();

        log('login...');
        const loginUrl = 'http://online.digi.hu/api/user/registerUser?_content_type=text%2Fjson&pass=:pass&platform=android&user=:email';
        const deviceReg = 'http://online.digi.hu/api/devices/registerPCBrowser?_content_type=text%2Fjson&dma=chrome&dmo=63&h=:hash&i=A5F0F867-B1A0-474A-BF32-938748A251B5&o=android&pass=:pass&platform=android&user=:email';

        request.get(loginUrl.replace(':email', config.USERDATA.email).replace(':pass', md5(config.USERDATA.pass)), (e, r, body) => {
            const loginResponse = JSON.parse(body);
            log('login::loginResponse::' + loginResponse.data.response);

            if (loginResponse.data.response === 'OK') {
                // megszereztük a hash-t
                this.loginHash = loginResponse.data.h;

                request.get(deviceReg.replace(':email', config.USERDATA.email).replace(':pass', md5(config.USERDATA.pass)).replace(':hash', this.loginHash), (e, r, body) => {
                    // beregisztráltuk és megszereztük a device_id-t
                    const deviceResponse = JSON.parse(body);
                    log('login::deviceResponse::' + deviceResponse.data.response);

                    if (deviceResponse.data.response === 'OK') {
                        this.deviceId = deviceResponse.data.id_device;

                        cb();
                    }
                    else {
                        log('login::deviceReg_fail::' + body);
                    }
                });
            }
            else {
                log('login::login_fail::' + body);
            }
        });
    }

    /**
     * Csatorna lista generálása
     * Lekéri a digi oldaláról az elérhető csatornalistát és kategóriákat, majd az alapján legenerálja az m3u fájlt
     */
    generateChannelList() {
        const self = this;
        log('generateChannelList::Csatornalista generalas...');

        request.get('http://online.digi.hu/api/playprograms/getAllCategoriesAndPrograms?_content_type=text%2Fjson&platform=android', (e, r, body) => {
            const programs = JSON.parse(body);
            this.generateM3u(programs.data, function (m3u) {
                fs.writeFileSync('../channels.m3u', m3u);
                self.generateEpg();
            });
        });
    }

    /**
     * Meghívásakor lekéri az aktuális m3u fájlt a digi szerveréről a lejátszáshoz, callback-ben beállítja a stream url-t
     * @param {Number} id
     * @param {callback} cb
     * @param {boolean} forceLogin
     */
    getDigiStreamUrl(id, cb, forceLogin = false) {
        this.login(() => {
            const streamUrl = 'http://online.digi.hu/api/streams/getStream?_content_type=text%2Fjson&action=getStream&h=:hash&i=:deviceId&id_stream=:streamId&platform=android';
            request.get(streamUrl
                .replace(':hash', this.loginHash)
                .replace(':deviceId', this.deviceId)
                .replace(':streamId', id), (e, r, body) => {
                const response = JSON.parse(body),
                    stream_url = response.stream_url;

                log(`getDigiStreamUrl::${id}::${stream_url}`);

                /**
                 * Hibás válasz esetén megpróbáljuk újraindítani a lekérést
                 */
                request.get(stream_url, (err, resp, body) => {
                    const findBestUrl       = typeof config.findBestUrl !== 'undefined' && config.findBestUrl || false,
                          findLowestUrl     = typeof config.findLowestStream !== 'undefined' && config.findLowestStream || false,
                          findMediumStream  = typeof config.findMediumStream !== 'undefined' && config.findMediumStream || false,
                          specialUrl        = findBestUrl || findLowestUrl || findMediumStream;

                    if (!err) {
                        // nem hagyományos urlt adunk vissza hanem direkt m3u stream url-t adunk
                        if (specialUrl) {
                            let streams = [];
                            body.split('\n').forEach(element =>  {
                                if (element.substring(0, 4) === 'http') {
                                    streams.push(element);
                                }
                            });

                            let spec_stream_url;

                            // Kiválasztjuk a legjobb forrást
                            if (findBestUrl) {
                                spec_stream_url = streams.pop();
                                log(`getDigiStreamUrl::mode_findBestUrl::${spec_stream_url}`);
                            }
                            // kiválasztjuk a közepes minőségű forrást
                            else if (findMediumStream) {
                                streams.reverse().pop();
                                spec_stream_url = streams.pop();
                                log(`getDigiStreamUrl::mode_findMediumStream::${spec_stream_url}`);
                            }
                            // kiválasztjuk a leggyengébb minőségű forrást
                            else {
                                spec_stream_url = streams.reverse().pop();
                                log(`getDigiStreamUrl::mode_findLowestUrl::${spec_stream_url}`);
                            }

                            spec_stream_url = spec_stream_url.replace(spec_stream_url.substr(-14), '');

                            cb(spec_stream_url);
                        }
                        else {
                            cb(stream_url);
                        }
                        this.reTryCounter = 0;
                    }
                    else {
                        log(`getDigiStreamUrl::invalidUri::reTry=${this.reTryCounter}`);
                        if (this.reTryCounter < 5) {
                            this.getDigiStreamUrl(id, cb, true);
                            this.reTryCounter++;
                        }
                        else {
                            throw 'Hibas valasz' + stream_url;
                        }
                    }
                });

                this.lastChannelUrl = stream_url;
            });
        }, forceLogin);
    }

    /**
     * Végrehajtja az 5 perces hellózást
     * @deprecated
     */
    ticker() {
        clearInterval(this.tickerSession);
        this.tickerCounter = 0;
        this.tickerSession = setInterval(() => {
            log(`ticking::${this.tickerCounter}::${this.lastChannelUrl}`);
            request.get(this.lastChannelUrl);
            this.tickerCounter++;

            if (this.tickerCounter > maxTicking) {
                clearTimeout(this.tickerSession);
            }
        }, 11 * 60 * 1000); // 11p
    }

    /**
     * Feldolgozza a digi oldaláról begyűjtött csatorna információkat
     * @param {object} programs
     * @param {callback} cb
     */
    generateM3u(programs, cb) {
        const self = this;

        let channelList = [],
            m3u_data = '#EXTM3U tvg-shift=3\n';

        for (let pkey in programs) {
            let categoryElement = programs[pkey];
            for (let ckey in categoryElement.programs) {
                let programElement = categoryElement.programs[ckey];
                channelList.push({
                    'program': programElement,
                    'category': categoryElement.category_name
                });
            }
        }

        /**
         * Legyártja a csatorna megnyitásához szükséges m3u-ba írt rekordokat
         * @param channel
         * @param cb
         */
        const makeProgramData = function (channel, cb) {
            let index       = channel.program.id_stream,
                name        = channel.program.stream_name,
                logo        = channel.program.logo,
                category    = channel.category;

            const header = `#EXTINF:-${index} tvg-id="id${index} tvg-name="${name}" tvg-logo="${logo}" group-title="${category}", ${name} \n`;
            const body   = `${config.preUrl}/${index}\n`;

            self.collectedChannels.push({
                channelIndex: index,
                name: name,
                id: 'id' + index
            });

            cb(header + body);
        };

        /**
         * Feldolgozza a csatornalista előállításához szükséges adatokat
         */
        const collectProgramData = function () {
            makeProgramData(channelList.pop(), channelLine => {
                m3u_data += channelLine;
                if (channelList.length) {
                    collectProgramData();
                }
                else {
                    cb(m3u_data);
                }
            });
        };

        log(`Channels: ${channelList.length}`);
        collectProgramData();
    }

    /**
     * Elektronikus programujságot generálunk
     */
    generateEpg() {
        const self = this;
        let epgChannels = '',
            epgPrograms = '',
            epgTimestampPath = '../epg.timestamp',
            epgUrls     = Epg.getChannelEpgUrls();

        let lastUpgrade;
        try {
            lastUpgrade = new Date(fs.readFileSync(epgTimestampPath).toString());
        } catch (e) {
            lastUpgrade = new Date('2000-01-01');
        }

        lastUpgrade.setDate(lastUpgrade.getDate() + 2);

        if (lastUpgrade > (new Date())) {
            log('EPG naprakesz');
            return;
        }

        log('EPG ujratoltese...');

        /**
         * XML legyártása
         */
        const writeXml = () => {
            let content = Epg.getXmlContainer(epgChannels + epgPrograms);
            fs.writeFileSync('../epg.xml', content);
            log('epg.xml ujrairva');
        };

        let channel_list_temp = self.collectedChannels.slice(0);
        let progress = setInterval(() => {
            // Ha elfogyott vége a dalnak, mentjük az xml-t
            if (channel_list_temp.length === 0) {
                clearInterval(progress);
                writeXml();
                return;
            }

            let channelElement  = channel_list_temp.pop(),
                channelIndex    = channelElement.channelIndex,
                name            = channelElement.name,
                id              = channelElement.id;

            if (typeof epgUrls[id] !== 'undefined') {
                epgChannels += Epg.getChannelEpg(channelIndex, name);

                Epg.loadEPG(epgUrls[id], function (shows) {
                    // log(epgUrls[id] + ' ' + shows.length + ' scannelt musor');
                    for (let i = 0; i < shows.length; i++) {
                        let endStartDate = new Date(shows[i].startDate);
                        epgPrograms += Epg.getProgrammeTemplate(
                            channelIndex,
                            shows[i].startDate,
                            typeof shows[i+1] !== 'undefined'
                                ? shows[i+1].startDate : endStartDate.setHours(endStartDate.getHours() + 1),
                            shows[i].name + ' ' + shows[i].description
                        );
                    }
                });
            }
        }, 500);

        fs.writeFileSync(epgTimestampPath, (new Date()).toString());

        /**
         * XML újragyártása 48 óránként
         */
        setTimeout(function () {
            log('XML ujragyartasa...');
            self.generateEpg();
        }, 48 * 60 * 60 * 1000);
    }
}

module.exports = DigiOnline;
