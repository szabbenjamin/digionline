import Log from "./log";
import Config from "./config";

/**
 * Hibás ssl tanúsítvány "figyelembe nem vétele" szükség esetén
 * Részletekért lásd: https://github.com/szabbenjamin/digionline/issues/25
 */
if (typeof Config.instance()['secureConnection'] !== 'undefined' && !Config.instance()['secureConnection']) {
    // @ts-ignore
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

    console.log(`#################################################
BIZTONSAGI FIGYELMEZTETES!
Az adatforgalmadat harmadik szemely meghamisithatja, felhasznalonev-jelszavadat ellophatja. Hasznalata ellenjavalt.
Az biztonsagos kapcsolat hasznalatahoz a config.ts-ben modositsd a secureConnection 'false'-rol 'true'-ra!
#################################################
    
    `);
}



const request = require('request').defaults({jar: true});

class Common {
    /**
     * Utolsó beküldött request ideje
     * @private
     */
    public static lastRequest : Date = new Date();

    /**
     * http request options paraméterei alapján cb response-ba kerülő válasszal
     * @param options
     * @param cb
     */
    public static request(options : object, cb : (response : string) => void) : void {
        try {
            request(options, (error, response, body) => {
                cb(body);
                Common.lastRequest = new Date();
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

    public static getUrlVars(uri) {
        const vars = {};
        uri.replace(/[?&]+([^=&]+)=([^&]*)/gi,
            function(m,key,value) {
                vars[key] = value;
            });
        return vars;
    }
}

export default Common;
