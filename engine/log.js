/**
 * Created by Ben
 * https://github.com/szabbenjamin/digionline
 */

const console_log = true;
const fs = require('fs');

/**
 * Log gyártása. Írja a logfájlba és kimenetre is.
 * Ha a kód kicsit stabilabb lesz a configba bekerül a console_log kapcsolgathatósága
 * @param input {string}
 */
const log = function (input, isError = false) {
    input = `${(new Date()).toString()} (${process.env.npm_package_version}) # ${input}`

    fs.appendFile('../log.log', input + '\r\n', () => {});
    if (console_log) {
        console.log(isError ? '\x1b[31m' : '', input, '\x1b[0m');
    }
};

module.exports = log;
