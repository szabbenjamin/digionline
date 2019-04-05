import Common from "./common";
import CONFIG from "../config";
import Log from "./log";
import * as jsdom from 'jsdom';
import FileHandler from "./file";
import Epg from "./epg";

const { JSDOM } = jsdom;

interface ChannelInterface {
    name : string,
    logoUrl : string,
    id : number,
    url : string | null,
    category: number
}

interface PlayerInterface {
    response : string,
    loaded : Date
}

class Digionline {
    private channelList : Array<ChannelInterface> = [];
    private lastHello : Date;
    private player : Array<PlayerInterface> = [];

    private channel : ChannelInterface | null;

    constructor(cb : () => void) {
        this.login(success => {
            if (success) {
                this.getChannelList(channelList => {
                    cb();
                    this.generateChannelList();
                    if (CONFIG.epg.needle) {
                        const epgEngine = new Epg();
                        epgEngine.setChannels(channelList);
                        epgEngine.generateEpg();
                    }
                });
            }
        });
        this.lastHello = new Date();
        this.channel = null;
    }

    private login(cb : (success : boolean) => void) : void {
        Log.write('Login digionline.hu');
        Common.request({
            uri: 'https://digionline.hu/login',
            method: 'GET'
        }, respose => {
            const dom = new JSDOM(respose);
            const token : string = dom.window.document.querySelector('[name="_token"]').value;
            Common.request({
                uri: 'https://digionline.hu/login',
                method: 'POST',
                formData: {
                    '_token': token,
                    email: CONFIG.login.email,
                    password: CONFIG.login.password,
                    accept: '1'
                }
            }, response => {
                this.checkLoggedIn(loggedIn => {
                    if (loggedIn) {
                        Log.write(`Logged in: ${CONFIG.login.email}`);
                    }
                    else {
                        Log.error(`Sikertelen belepes`, '1');
                    }
                    cb(loggedIn);
                });
            });
        });
    }

    /**
     * cb-ben visszaadjuk be vagyunk-e már jelentkezve
     * @param loggedIn
     */
    public checkLoggedIn(loggedIn : (loggedIn : boolean) => void) : void {
        Common.request({
            uri: 'https://digionline.hu/',
            method: 'GET'
        }, response => {
            const dom = new JSDOM(response);
            const loggedEmail = dom.window.document.querySelector('.in-user').textContent.trim();
            loggedIn(loggedEmail === CONFIG.login.email);
        });
    }

    public getChannelList(cb : (channelList : Array<ChannelInterface>) => void) : void {
        Log.write('Loading channel list...');
        Common.request({
            uri: 'https://digionline.hu/csatornak',
            method: 'GET'
        }, response => {
            const dom = new JSDOM(response);
            dom.window.document.querySelectorAll('.channel').forEach(channelBox => {
                const name : string = channelBox.querySelector('.channels__name').textContent.trim();
                const logoUrl : string = channelBox.querySelector('img').src;
                const id : number = Number(channelBox.querySelector('.favorite').getAttribute('data-id'));
                const category : number = Number(channelBox.getAttribute('data-category'));

                this.channelList.push({
                    name: name,
                    logoUrl: logoUrl,
                    id: id,
                    url: null,
                    category: category
                });
            });
            Log.write(`Channels loaded`, this.channelList.length);
            cb(this.channelList);
        });
    }

    private generateChannelList() : void {
        Log.write('Generating channel list...', '.m3u8');
        let simpleIPTVList = `#EXTM3U tvg-shift="${Common.getStaticTimeZoneOffset()}"\n`,
            tvheadendList = simpleIPTVList;


        this.channelList.forEach(channel => {
            const header = `#EXTINF:-${channel.id} tvg-id="id${channel.id}" tvg-name="${channel.name}" tvg-logo="${channel.logoUrl}" group-title="${channel.category}", ${channel.name} \n`,
                url = `http://${CONFIG.webconnect.domain}:${CONFIG.webconnect.port}/channel/${channel.id}`;

            // for Simple IPTV plugin
            simpleIPTVList += header;
            simpleIPTVList += `${url}\n`;

            // for TVHeadend
            tvheadendList += header;
            tvheadendList += `pipe:///usr/bin/ffmpeg -i ${url} -c copy -f mpegts pipe:1\n`;
        });

        FileHandler.writeFile('channels_IPTV.m3u8', simpleIPTVList);
        FileHandler.writeFile('channels_tvheadend.m3u8', tvheadendList);
    }

    private getChannelById(id : number) : ChannelInterface {
        const cl = this.channelList;
        for (let i in cl) {
            if (cl[i].id === id) {
                return cl[i];
            }
        }

        Log.error(`channel (${id}) is not found`);
        throw new Error();
    }

    public getChannel(id, cb : (channel : ChannelInterface) => void) : void {
        if (this.channel && this.channel.id === id) {
            Log.write('Channel full cache', id, this.channel.name);
            cb(this.channel);
            return;
        }

        const loadChannel = response => {
            let r = response.split('https://online.digi.hu/api/streams/playlist/')[1]
                .split('.m3u8');

            const playlistUrl = `https://online.digi.hu/api/streams/playlist/${r[0]}.m3u8`;

            Common.request({
                uri: playlistUrl,
                method: 'GET'
            }, playlistContent => {
                let videoStreamUrl = '',
                    backupVideoStreamUrl = '';
                playlistContent.split('\n').forEach(row => {
                    if (row.substring(0, 5) === 'https') {
                        backupVideoStreamUrl = row;
                        if (row.indexOf(`&q=${CONFIG.videoQuality}`) !== -1) {
                            videoStreamUrl = row;
                        }
                    }
                });

                const channel = this.getChannelById(id);
                channel.url = (videoStreamUrl || backupVideoStreamUrl).split('&_t=')[0];

                this.channel = channel;

                cb(channel);
            });
        };

        const channelKey = `id_${id}`;
        if (typeof this.player[channelKey] === 'undefined' || (typeof this.player[channelKey] !== 'undefined' && Common.diffTime(this.player[channelKey].loaded, new Date()) > 5)) {
            Common.request({
                uri: `https://digionline.hu/player/${id}`,
                method: 'GET'
            }, response => {
                loadChannel(response);
                this.player[channelKey] = {
                    loaded: new Date(),
                    response : response
                };
                Log.write('loaded from request', channelKey);
            });
        }
        else {
            Log.write(`loaded from cache`, channelKey);
            loadChannel(this.player[channelKey].response);
        }

    }

    /**
     * kapcsolat fenntartása (kössz a segítséget! :D)
     * @param id
     */
    public hello(id : number) : void {
        if (Common.diffTime(new Date(), this.lastHello) > 30) {
            Common.request({
                uri: `https://digionline.hu/refresh?id=${id}`,
                method: 'GET',
                headers: {
                    'Referer': `https://digionline.hu/player/${id}`,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }, response => {
                Log.write('Hello packet sent...', response);
            });
            this.lastHello = new Date();
        }

    }
}

export {Digionline, ChannelInterface, PlayerInterface};
