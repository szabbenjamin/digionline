/**
 * Created by Ben
 * https://github.com/szabbenjamin/digionline
 */

var jsdom = require("jsdom");
var $ = require("jquery")(jsdom.jsdom().defaultView);
var request = require('request');
var request = request.defaults({jar: true});
const readlineSync = require('readline-sync');
const fs = require('fs');
const exec = require('child_process').exec;
var log = require('./log.js');
var moment = require('moment');


/**
 * Olvasnivalók:
 * https://en.wikipedia.org/wiki/Electronic_program_guide
 * http://kodi.wiki/view/Add-on:IPTV_Simple_Client
 */
class Epg {
    constructor () {
        this.channelEpg = {
            "40":  'M2',
            "39":  'M1',
            "43":  'DUNA',
            "41":  'M4_SPORT',
            "44":  'DUNAWORLD',
            "132": 'M5',
            "207": 'NICKELODEON',
            "206": 'FEM3',
            "208": 'SUPERTV2',
            "10":  'COMEDY',
            "34":  'COOL',
            "32":  'FILMPLUS',
            "220": 'NATGEO',
            "29":  'RTL2',
            "37":  'RTL',
            "204": 'TV2',
            "2":   'HIT_MUSIC',
            "212": 'IZAURA_TV',
            "222": 'NATGEOWILD',
            "45":  'VIASATHIST',
            "21":  'VIASATNAT',
            "7":   'DIGIANIMALWORLD',
            "35":  'PARAMOUNT',
            "225": 'PRIME',
            "12":  'DIGILIFE',
            "130": 'SPEKTRUM',
            "11":  'DIGIFILM',
            "1":   'DIGIWORLD',
            "219": 'RTL_SPIKE',
            "215": 'TLC',
            "26":  'DIGISPORT1',
            "27":  'DIGISPORT2',
            "131": 'DIGISPORT3',
            "205": 'EUROSPORT',
            "4":   'VIASATHIST',
            "211": 'HUMOR_PLUSZ',
            "210": 'EUROSPORT2',
            "227": 'LiChi TV',
            "23":  'PAPRIKA',
            "42":  'AMC',
            "216": 'ZENEBUTIK',
            "217": 'MTVHU',
            "213": 'KIWI_TV',
            "214": 'MOZI_PLUSZ',
            "203": 'DISCOVERY',
            "118": 'SPORT2',
            "126": 'SPORT1',
            "5":   'MUSICCHANNEL',
            "226": 'MINIMAX',

        };
    }

    getUrl() {
        return "http://epg.gravi.hu/guide.xml";
    }

    getEpg(key, direction = false)
    {
        if(direction === false)
        {
             if(this.channelEpg.hasOwnProperty(key))
                 return this.channelEpg[key];
             return null;
        }
        return this.findKey(this.channelEpg, key);
    }

    getChannelEpg () {
        return this.channelEpg;
    }

    findKey(obj, value)
    {
        for (var prop in obj)
        {
             if (obj.hasOwnProperty(prop))
             {
                  if (obj[prop] === value)
                  {
                       return prop;
                  }
             }
        }
        return null;
    };

    /**
     * Műsorok letöltése
     * @param epgUrl
     * @param cb
     */
    generateEpg(cb) {
	var self = this;
	var headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
            'Content-Type' : 'application/x-www-form-urlencoded'
        };
        request.get(
		this.getUrl(),
		{
			headers: headers
		},
		function (error, response, body) {
			body = body.split('+0200').join('+0300');
			cb(body);
			return;
			
			let xml = $(body);

			let result = $('<tv></tv>');

			$.each(self.getChannelEpg(), function (id, xmlId) {
				log('channel[id="'+xmlId+'"]');
				let c = $('channel[id="'+xmlId+'"]',xml).clone();
				c.appendTo(result);
				log('programme[channel="'+xmlId+'"]');
				let p = $('programme[channel="'+xmlId+'"]',xml).clone();
				p.appendTo(result);
				/*$('channel[id="'+xmlId+'"]',xml).attr('id', id);
				log("Csatorna "+xmlId+" csere "+id);
				$('programme[channel="'+xmlId+'"]',xml).attr('channel', id);
				log("Program "+xmlId+" csere "+id);
				ids.push(id);*/
			});

			$('programme',result).each(function(index,prog){
				let programme = $(prog);
				var startCorrect = self.parseDate(programme.attr('start'));
				// időzóna korrekció
				startCorrect.setHours(startCorrect.getHours() - 1);

				var endCorrect = self.parseDate(programme.attr('stop'));
				// időzóna korrekció
				endCorrect.setHours(endCorrect.getHours() - 1);

				// Nem lehet egyszerre egy csatornán egy másodpercben egy csatornának kezdete és vége, így kivontunk belőle 1 mp-et
				//endCorrect.setMilliseconds(endCorrect.getMilliseconds() - 1000);
				programme.attr('start', self.formatDate(startCorrect));
				programme.attr('stop', self.formatDate(endCorrect));
				programme.appendTo(result);
			});

			cb('<?xml version="1.0" encoding="UTF-8"?>'+result[0].outerHTML);

			return;

			let ids = [];

			let xmlIds = [];

			$.each(self.getChannelEpg(), function (id, xmlId) {
				xmlIds.push(xmlId);
			});

			/*log("Azonositatlan csatornak torlese");
			log('channel:not([id="'+xmlIds.join('"], [id="')+'"])');
			$('channel:not([id="'+xmlIds.join('"], [id="')+'"])',xml).remove();
			log("Azonositatlan programok torlese");
			log('programme:not([channel="'+xmlIds.join('"], [channel="')+'"])');
			$('programme:not([channel="'+xmlIds.join('"], [channel="')+'"])',xml).remove();*/

			$.each(self.getChannelEpg(), function (id, xmlId) {
				log('channel[id="'+xmlId+'"]');
				let c = $('channel[id="'+xmlId+'"]',xml).clone();
				c.attr('id', id).appendTo(result);
				log('programme[channel="'+xmlId+'"]');
				let p = $('programme[channel="'+xmlId+'"]',xml).clone();
				p.attr('channel', id).appendTo(result);
				/*$('channel[id="'+xmlId+'"]',xml).attr('id', id);
				log("Csatorna "+xmlId+" csere "+id);
				$('programme[channel="'+xmlId+'"]',xml).attr('channel', id);
				log("Program "+xmlId+" csere "+id);
				ids.push(id);*/
			});

			cb('<?xml version="1.0" encoding="UTF-8"?>'+result[0].outerHTML);
		}
	);

    }

    parseDate (date) {
	var parsed = moment(date, 'YYYYMMDDHHmmss ZZ', true);
	if (parsed.isValid()) {
        	return parsed.toDate();
	}
	return null;
    }

    formatDate (date) {
	return moment(date).format('YYYYMMDDHHmmss ZZ');
        var d       = new Date(date);
        var year    = d.getFullYear();
        var month   = d.getMonth()+1;
        var day     = d.getDate();
        var hour    = d.getHours();
        var minute  = d.getMinutes();
        var second  = d.getSeconds();
        if(month.toString().length == 1) {
            var month = '0'+month;
        }
        if(day.toString().length == 1) {
            var day = '0'+day;
        }
        if(hour.toString().length == 1) {
            var hour = '0'+hour;
        }
        if(minute.toString().length == 1) {
            var minute = '0'+minute;
        }
        if(second.toString().length == 1) {
            var second = '0'+second;
        }

        return '' + year+month+day+hour+minute+second;
    }
}

module.exports = Epg;
