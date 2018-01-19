const jsdom = require("jsdom");
const $ = require("jquery")(jsdom.jsdom().defaultView);
let request = require('request');
request = request.defaults({jar: true});
const readlineSync = require('readline-sync');
const fs = require('fs');
const epgClass = require('./epg');
const Epg = new epgClass();
const log = require('./log.js');
const md5 = require('md5')

const config = require('../config.js');

const header = function () {
    return {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'hu-HU,hu;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Host': 'onlineplayer.digi.hu',
        'Pragma': 'no-cache',
        'Referer': 'http://onlineplayer.digi.hu/',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LYZ28E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Mobile Safari/537.36'
    };
};

const maxTicking = 20;

class DigiOnline {
    constructor() {
        const self = this;

        this.loginHash;
        this.deviceId;

        this.lastChannelUrl;
        this.tickerCounter = 0;
        this.tickerSession;

        this.collectedChannels = [];
        this.login(function () {
            self.generateChannelList();
        });
    }

    login(cb) {
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
                });
            }
        });
    }

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

    getDigiStreamUrl(id, cb) {
        const streamUrl = 'http://online.digi.hu/api/streams/getStream?_content_type=text%2Fjson&action=getStream&h=:hash&i=:deviceId&id_stream=:streamId&platform=android';
        request.get(streamUrl
                .replace(':hash', this.loginHash)
                .replace(':deviceId', this.deviceId)
                .replace(':streamId', id), (e, r, body) => {
            const response = JSON.parse(body),
                stream_url = response.stream_url;

            log(`getDigiStreamUrl::${id}::${stream_url}`);
            cb(stream_url);

            this.lastChannelUrl = stream_url;
        });
    }

    ticker() {
        clearInterval(this.tickerSession);
        this.tickerSession = setInterval(() => {
            log(`ticking::${this.tickerCounter}::${this.lastChannelUrl}`);
            request.get(this.lastChannelUrl);
            this.tickerCounter++;

            if (this.tickerCounter > maxTicking) {
                clearTimeout(this.tickerSession);
            }
        }, 5 * 60 * 1000); // 5p
    }

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

    generateEpg() {
        const self = this;
        let epgChannels = '',
            epgPrograms = '',
            epgUrls     = Epg.getChannelEpgUrls();

        log('EPG ujratoltese...');

        /**
         * XML legyártása
         */
        const writeXml = () => {
            var content = Epg.getXmlContainer(epgChannels + epgPrograms);
            fs.writeFileSync('../epg.xml', content);
            log('epg.xml ujrairva');
        };

        let channel_list_temp = self.collectedChannels;
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
                    log(epgUrls[id] + ' ' + shows.length + ' scannelt musor');
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
        }, 2000);

        /**
         * XML újragyártása 12 óránként
         */
        setTimeout(function () {
            log('XML ujragyartasa...');
            self.generateEpg();
        }, 12 * 60 * 60 * 1000);
    }
}

module.exports = DigiOnline;