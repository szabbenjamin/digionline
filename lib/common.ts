import Log from "./log";

const request = require('request').defaults({jar: true});

class Common {
    /**
     * http request options paraméterei alapján cb response-ba kerülő válasszal
     * @param options
     * @param cb
     */
    public static request(options : object, cb : (response : string) => void) : void {
        try {
            request(options, (error, response, body) => {
                cb(body);
            });
        } catch (e) {
            Log.write('Common@request', 'request error');
            cb('');
        }

    }

    /**
     * Két időpont közötti különbség másodpercekben
     * @param date1
     * @param date2
     */
    public static diffTime(date1 : Date, date2 : Date) : number {
        try {
            const d1 : number = date1.getTime(),
                d2 : number = date2.getTime();
            return Math.abs(d1 - d2) / 1000;
        } catch (e) {
            Log.error(e);
        }
    }

    /**
     * Téli-nyári időeltolódás igazítás
     */
    public static getStaticTimeZoneOffset() : number {
        return (new Date().getTimezoneOffset() / 60) * -1
    }
}

export default Common;
