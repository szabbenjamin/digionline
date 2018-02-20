/**
 * Created by Ben
 * https://github.com/szabbenjamin/digionline
 */

const http = require("http");
const log = require('./log.js');
const DigiOnline = require('./digionline.js');
const config = require('../config.js');
const fs = require('fs');

log('#################Program starting#################');

const digi = new DigiOnline();

const server = http.createServer(function(request, response) {
    let get = decodeURIComponent(request.url.substring(1));
    if (!isNaN(get)) {
        digi.getDigiStreamUrl(get, response_url => {
            response.writeHead(302, {
                'Location': response_url
            });
            digi.ticker();
            response.end();
        });
    }
    else if (get === 'channels.m3u') {
        log('load::channels.m3u');
        response.write(fs.readFileSync('../channels.m3u').toString());
        response.end();
    }
    else if (get === 'epg.xml') {
        log('load::epg.xml');
        response.write(fs.readFileSync('../epg.xml').toString());
        response.end();
    }
    else {
        response.end();
    }
});

try {
    /**
     * Feldolgozzuk a config fájlban beállított preUrl-t és kinyerjük belőle a portszámot.
     * Ezen fog hallgatni a servlet
     * @type {Number}
     */
    const listenPort = parseInt(config.preUrl.split(':')[2].replace('/', ''));
    if (!isNaN(listenPort) && listenPort > 0) {
        server.listen(listenPort);
        log("Server is listening: " + config.preUrl);
    }
    else {
        log(' HIBA! Érvénytelen megadott port: ' + listenPort);
        return;
    }

} catch (e) {
    log('Hiba tortent: ' + e.toString());
    return;
}

