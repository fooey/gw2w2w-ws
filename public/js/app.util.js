/*!
*
*	APP.LIB
*
*/
(function(modules){
    "use strict"


    /*
    *
    *   DEFINE "EXPORT"
    */

    var util = {};
    modules.util = util;



    /*
    *
    *   PRIVATE PROPERTIES
    *
    */

    var __INSTANCE = {
    	waitingForReload: false,
    };


    /*
    *
    *   DOM INIT
    *
    */
	$(function(){
	     $('<div id="priorityAlert" class="alert alert-danger" style="margin: 1em 0; padding: 1em; text-align: center; vertical-align: middle;"><h1>Application has requested a page reload</h1></div>')
	     	.hide()
	     	.prependTo('#content')
	});



    /*
    *
    *   PUBLIC METHODS
    *
    */

	util.reloadDelayed = function(msMin, msMax){
	    if(msMin && !msMax){
	        msMax = msMin;
	    }
	    else if(!msMin && !msMax){
	        msMax = msMax || 1*100;
	        msMin = msMin || 3*100;
	    }
	    var ms = ms || _.random(msMin, msMax);
	    reload(ms);
	}



	util.isJSON = function(data) {
	    var isJson = false
	    try {
	        // this works with JSON string and JSON object, not sure about others
	       var json = $.parseJSON(data);
	       isJson = typeof json === 'object' ;
	    } catch (ex) {}
	    return isJson;
	}



	util.minuteFormat = function (seconds){
	    var minutes = Math.floor(seconds / 60);
	    seconds -= (minutes * 60);
	    
	    seconds = ('00' + seconds);
	    seconds = seconds.substring(seconds.length-2, seconds.length);
	    
	    var txt = minutes + ':' +  seconds;
	    
	    return txt;
	}



	/*
	 * Date Format 1.2.3
	 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
	 * MIT license
	 *
	 * Includes enhancements by Scott Trenda <scott.trenda.net>
	 * and Kris Kowal <cixar.com/~kris.kowal/>
	 *
	 * Accepts a date, a mask, or a date and a mask.
	 * Returns a formatted version of the given date.
	 * The date defaults to the current date/time.
	 * The mask defaults to dateFormat.masks.default.
	 */

	util.dateFormat = function () {
		var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
			timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
			timezoneClip = /[^-+\dA-Z]/g,
			pad = function (val, len) {
				val = String(val);
				len = len || 2;
				while (val.length < len) val = "0" + val;
				return val;
			};

		// Regexes and supporting functions are cached through closure
		return function (date, mask, utc) {
			var dF = util.dateFormat;

			// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
			if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
				mask = date;
				date = undefined;
			}

			// Passing date through Date applies Date.parse, if necessary
			date = date ? new Date(date) : new Date;
			if (isNaN(date)) throw SyntaxError("invalid date");

			mask = String(dF.masks[mask] || mask || dF.masks["default"]);

			// Allow setting the utc argument via the mask
			if (mask.slice(0, 4) == "UTC:") {
				mask = mask.slice(4);
				utc = true;
			}

			var	_ = utc ? "getUTC" : "get",
				d = date[_ + "Date"](),
				D = date[_ + "Day"](),
				m = date[_ + "Month"](),
				y = date[_ + "FullYear"](),
				H = date[_ + "Hours"](),
				M = date[_ + "Minutes"](),
				s = date[_ + "Seconds"](),
				L = date[_ + "Milliseconds"](),
				o = utc ? 0 : date.getTimezoneOffset(),
				flags = {
					d:    d,
					dd:   pad(d),
					ddd:  dF.i18n.dayNames[D],
					dddd: dF.i18n.dayNames[D + 7],
					m:    m + 1,
					mm:   pad(m + 1),
					mmm:  dF.i18n.monthNames[m],
					mmmm: dF.i18n.monthNames[m + 12],
					yy:   String(y).slice(2),
					yyyy: y,
					h:    H % 12 || 12,
					hh:   pad(H % 12 || 12),
					H:    H,
					HH:   pad(H),
					M:    M,
					MM:   pad(M),
					s:    s,
					ss:   pad(s),
					l:    pad(L, 3),
					L:    pad(L > 99 ? Math.round(L / 10) : L),
					t:    H < 12 ? "a"  : "p",
					tt:   H < 12 ? "am" : "pm",
					T:    H < 12 ? "A"  : "P",
					TT:   H < 12 ? "AM" : "PM",
					Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
					o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
					S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
				};

			return mask.replace(token, function ($0) {
				return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
			});
		};
	}();

    

    /*
    *
    *   PRIVATE METHODS
    *
    */

	function reload(ms){
	    // possible for multiple WS messages to trigger reloads, only allow one
	    if(!__INSTANCE.waitingForReload){
	        __INSTANCE.waitingForReload = true;
	        console.log('Reloading in %d ms', ms);

	       
	        $('#priorityAlert').slideDown('fast');

	        setTimeout(function(){

	            $('#priorityAlert')
	                .find('h3')
	                    .fadeOut('fast', function(){
	                        $(this).remove();
	                    });

	            $.ajax({
	                url: window.location,
	                type: 'head',
	                timeout: (3*1000)
	            }).done(function(data, textStatus, jqXHR){
	                window.location.reload()
	            }).fail(function(data, textStatus, jqXHR){
	                console.log('*********************************');
	                console.log(' App not ready, requeuing reload ');
	                console.log('*********************************');

	                $('#priorityAlert')
	                    .css({minHeight: '160px'})
	                    .append(
	                         $('<h3>Application unavailable, requeuing page reload...</h3>')
	                            .hide()
	                            .fadeIn('fast')
	                    );

	                __INSTANCE.waitingForReload = false;
	                util.reloadDelayed(4000, 8000);
	            });
	        }, ms);
	    }
	}



	// Some common format strings
	util.dateFormat.masks = {
		"default":      "ddd mmm dd yyyy HH:MM:ss",
		shortDate:      "m/d/yy",
		mediumDate:     "mmm d, yyyy",
		longDate:       "mmmm d, yyyy",
		fullDate:       "dddd, mmmm d, yyyy",
		shortTime:      "h:MM TT",
		mediumTime:     "h:MM:ss TT",
		longTime:       "h:MM:ss TT Z",
		isoDate:        "yyyy-mm-dd",
		isoTime:        "HH:MM:ss",
		isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
		isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
	};



	// Internationalization strings
	util.dateFormat.i18n = {
		dayNames: [
			"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
			"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
		],
		monthNames: [
			"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
			"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
		]
	};



	// // For convenience...
	// Date.prototype.format = function (mask, utc) {
	// 	return dateFormat(this, mask, utc);
	// };



}(window.modules));














