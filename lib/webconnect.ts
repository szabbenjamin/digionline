import * as http from 'http';
import {Digionline} from "./digionline";
import Log from "./log";
import CONFIG from "../config";
import FileHandler from "./file";
import Common from "./common";
import Config from "./config";

class Webconnect {
    private digi : Digionline;
    private server : any;
    private translations : {oldIds : Array<number>, pairs : Array<{o : number, n : number}>};

    public constructor() {
        const filesAllowed = [
            '/channels_IPTV.m3u8',
            '/channels_tvheadend.m3u8',
            '/epg.xml',
            '/channels.csv'
        ];

        this.server = http.createServer((request, response) => {
            const get = decodeURIComponent(request.url);

            if (get.indexOf('/channel/') !== -1) {
                this.getChannel(get, response);
            }
            else if (filesAllowed.indexOf(get) !== -1) {
                this.getFile(get, response);
            }
            else {
                Log.write('File or service not found', get);
                response.end();
            }
        });

        this.showServices(filesAllowed);

        this.translations = this.initTranslate();
    }

    private showServices (filesAllowed : Array<string>) : void {
        Log.write('===Elerheto csatornalista formatumok kulso lejatszokhoz===');
        for (let file of filesAllowed) {
            Log.write(`http://${Config.instance().webconnect.domain}:${Config.instance().webconnect.port}${file}`);
        }
    }

    public listen() : void {
        try {
            this.server.listen(Config.instance().webconnect.port);
            Log.write('Server is listening');
        } catch (e) {
            Log.error(e);
        }
    }

    public setDigi(digi : Digionline) : void {
        this.digi = digi;
    }

    private getChannel(get : string, response : any) : void {
        const self = this;
        let id : number = Number(get.replace('/channel/', '').replace('.m3u8', ''));

        Log.write(`GET channel ${id}`);

        // ha olyan ID-t kap ami még egy régi rendszerezésből származik át kell forgatnunk az új ID-ra
        if (this.translations.oldIds.indexOf(id) !== -1) {
            Log.write('Ez egy regi rendszeru ID, frissitsd a listadat!');
            let oldId = id;
            id = this.getNewId(id);
            Log.write(`Regi-uj ID atforgatas sikeres. oldId: ${oldId}, newId: ${id}`);
        }

        this.digi.getChannel(id, channel => {
            const channelUrl = channel.url.replace('https', 'http');
            http.get(channelUrl, function (proxyRes) {
                let data = '';
                proxyRes.on('data', function (chunk) {
                    data += chunk;
                    Log.write('Buffering...', channel.id, channel.name, Common.getUrlVars(channel.url)['q']);
                });
                proxyRes.on('end', function () {
                    response.end(data);
                    Log.write('Playing...', channel.id, channel.name, Common.getUrlVars(channel.url)['q']);
                    self.digi.hello(channel.id);
                });
                proxyRes.on('error', function () {
                    Log.error(arguments);
                });
            });
        });
    }

    private getFile(get: string, response : any) : void {
        Log.write('file webrequested', get);
        const fileContent = FileHandler.readFile(`.${get}`).toString();
        response.write(fileContent);
        response.end();
    }

    /**
     * Mivel megváltoztak a csatorna id-k így készült egy eljárás arra az esetre, hogy a régieket az új id-ra forgassa át
     * Hasznos abban az esetben ha tvheadend-ben nem kívánjuk az összes csatornát egyesével átírkálni (én nem kívántam)
     */
    private initTranslate() : {oldIds : Array<number>, pairs : Array<{o : number, n : number}>} {
        const oldIds = [],
            pairs = FileHandler.readJsonFile('helpers/pairs.json') as Array<{o : number, n : number}>;

        for (let row of pairs) {
            oldIds.push(row.o);
        }

        return {
            oldIds: oldIds,
            pairs: pairs
        }
    }

    private getNewId(oldId : number) : number {
        if (this.translations.pairs.length === 0) {
            throw new Error('Pairs array is empty');
        }

        for (let row of this.translations.pairs) {
            if (row.o === oldId) {
                return row.n;
            }
        }

        throw new Error('oldId not exist');
    }
}

export default Webconnect;
