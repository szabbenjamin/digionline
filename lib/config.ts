import FileHandler from "./file";

export default class Config {
    private static parsedContent : object|undefined;

    public static instance() : any {
        if (typeof Config.parsedContent === 'undefined') {
            try {
                Config.parsedContent = FileHandler.readJsonFile('config.json');
                Config.check(Config.parsedContent);
            } catch (e) {
                throw new Error('config.json hiba! ' + e);
            }
        }
        return Config.parsedContent;
    }

    private static check(parsedContent : any) : void {
        if (parsedContent.webconnect.domain.length === 0) {
            throw new Error('Nem adtál meg domain nevet az servletednek - alapértelmezett: localhost');
        }
        if (isNaN(parsedContent.webconnect.port) || parsedContent.webconnect.port < 1 || parsedContent.webconnect.port > 65534) {
            throw new Error('Hibásan megadott port. Szám kell legyen 1-65534 között.');
        }
        if (['lq', 'mq', 'hq'].indexOf(parsedContent.videoQuality) === -1) {
            throw new Error('Érvénytelen videoQuality érték. Választható verziók: lq, mq, hq');
        }
        if (parsedContent.login.email === '' || parsedContent.login.password === '') {
            throw new Error('Nincs megadva felhasználónév vagy jelszó!');
        }
        if (['mai', 'heti'].indexOf(parsedContent.epg.type) === -1) {
            throw new Error('Érvénytelen epg típus lett megadva. Választható: heti, napi');
        }
    }
}
