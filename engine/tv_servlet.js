/**
 * Created by Ben
 * https://github.com/szabbenjamin/digionline
 */

const http = require("http");
const log = require('./log.js');
const DigiOnline = require('./digionline.js');
const config = require('../config.js');
const fs = require('fs');

log(`DIGIONLINE connect elindul (${process.env.npm_package_version})`);

const digi = new DigiOnline();

const server = http.createServer(function(request, response) {
    let get = decodeURIComponent(request.url.substring(1));
    if (!isNaN(get)) {
        digi.getDigiStreamUrl(get, (response_url, channelName) => {
            http.get(response_url, function (proxyRes) {
                let data = '';
                proxyRes.on('data', function (chunk) {
                    data += chunk;
                    log('Buffering...');
                });
                proxyRes.on('end', function () {
                    response.end(data);
                    log(`Play (${channelName})`)
                });
                proxyRes.on('error', function () {
                    log(arguments, true);
                });
            });
        });
    }
    else if (get === 'channels.m3u') {
        log('load::channels.m3u');
        response.write(fs.readFileSync('../channels.m3u').toString());
        response.end();
    }
    else if (get === 'tvheadend_channels.m3u') {
        log('load::tvheadend_channels.m3u');
        response.write(fs.readFileSync('../tvheadend_channels.m3u').toString());
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
        log(' HIBA! Érvénytelen megadott port: ' + listenPort, true);
        return;
    }

} catch (e) {
    log('Hiba tortent: ' + e.toString(), true);
    return;
}

