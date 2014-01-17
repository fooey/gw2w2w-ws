/*!
*
*   APP
*
*/

var $overview, $tracker;

$(function(){
    $overview = $('.overview');
    if($overview.length){
        async.each(
            $overview.find('.pie'),
            function(pie, nextPie){
                drawPie($(pie))
                nextPie(null)
            },
            _.noop
        );
    }

    
    $tracker = $('#tracker');
    if($tracker.length){
        onInterval(1000/3)
    };


    $log = $('#log');
    if($log.length){
        initLog($log);
    };


});;

/*!
*
*	APP.LIB
*
*/



var waitingForReload = false;

var $alertDiv;
$(function(){
     $('<div id="priorityAlert" class="alert alert-danger" style="margin: 1em 0; padding: 1em; text-align: center; vertical-align: middle;"><h1>Application has requested a page reload</h1></div>').hide().prependTo('#content')
});

function reload(ms){
    // possible for multiple WS messages to trigger reloads, only allow one
    if(!waitingForReload){
        waitingForReload = true;
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

                waitingForReload = false;
                reloadDelayed(4000, 8000);
            });
        }, ms);
    }
}


function reloadDelayed(msMin, msMax){
    if(msMin && !msMax){
        msMax = msMin;
    }
    else if(!msMin && !msMax){
        msMax = msMax || 1*100;
        msMin = msMin || 3*100;
    }
    var ms = ms || randRange(msMin, msMax);
    reload(ms);
}
function reloadNow(){
    reload(0);
}


function isJSON(data) {
    var isJson = false
    try {
        // this works with JSON string and JSON object, not sure about others
       var json = $.parseJSON(data);
       isJson = typeof json === 'object' ;
    } catch (ex) {}
    return isJson;
}


function minuteFormat(seconds){
    var minutes = Math.floor(seconds / 60);
    seconds -= (minutes * 60);
    
    seconds = ('00' + seconds);
    seconds = seconds.substring(seconds.length-2, seconds.length);
    
    var txt = minutes + ':' +  seconds;
    
    return txt;
}

function randRange(rangeMin, rangeMax) {
    var randInRange = Math.round(
        (
            Math.random()
            * (rangeMax - rangeMin)
        )
        + rangeMin
    );
    return randInRange;
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

var dateFormat = function () {
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
		var dF = dateFormat;

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

// Some common format strings
dateFormat.masks = {
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
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
	return dateFormat(this, mask, utc);
};;


/*!
*
*   APP.WSCLIENT
*
*/



var subscribeToChannel = function (channel) {
    var wsHost = ['ws://', window.location.hostname, ':', window.location.port].join('');
    var wsClient = new WebSocket(wsHost);

    console.log('Subscribing to channel', channel)

    wsClient.onopen = function () {
        var packet = { event: 'subscribe', channel: channel };
        console.log('WS Send:', packet);
        wsClient.send(JSON.stringify(packet))
    };
    wsClient.onclose = function () {
        reloadDelayed();
    };

    wsClient.onmessage = function (event) {
        var packets = event.data;

        console.log('Recieved WS Message: ', packets);

        if (isJSON(packets)) {
            packets = JSON.parse(packets);
        }

        if(!Array.isArray(packets)){
            packets = [packets];
        }


        async.each(
            packets,
            function(packet, nextPacket){
                handlePacket(packet, channel);
                nextPacket(null)
            },
            _.noop
        );

    };
}

function handlePacket(packet, channel){
    if(packet.event && (
        packet.event === 'resync'
        || packet.event === 'desync'
    )){
        globalEvents(packet);
    }
    else{
        switch(channel){
            case 'global':
            case 'loading':
                globalEvents(packet);
                break;

            case 'overview':
                overviewEvents(packet);
                break;

            default:
                trackerEvents(packet);
                break;
        }
    }
}



function globalEvents(message){
    console.log('WS Global:', message)
    if (message.event){
        switch(message.event){
            case 'desync':
            case 'resync':
            case 'reset':
                reloadDelayed();
                break;
        }
    }
};


/*!
*
*   APP.OVERVIEW
*
*/


function overviewEvents(message){
    if (message.event){
        if(message.event === 'updateScore') {
            var eventArgs = message.arguments;
            console.log('update match scores', eventArgs.matchId);
            var $match = $('#match' + eventArgs.matchId);

            async.each(
                $match.find('.world'),
                function(world, nextWorld){
                    var $world = $(world);
                    var worldIndex = $world.data('worldindex');
                    var score = Humanize.intcomma(eventArgs.scores[worldIndex]);

                    $world.find('.score').text(score)

                    nextWorld(null);
                },
                _.noop
            );

            drawPie($match.find('.pie'));
        }
    }
}



var chartOptions = {
    width: 90,
    height: 90,
    chartArea: {width: '100%', height: '100%'},
    colors: ['#a94442', '#31708f', '#3c763d'],
    enableInteractivity: false,
    pieSliceText: 'none',
    legend: {position: 'none'},
    tooltip: {textStyle: {
        fontSize: '9'
    }},
};
var drawPie = function($pie){
    var $match = $pie.closest('.match');
    var matchId = $match.data('matchid');

    var $red = $match.find('.world.red');
    var redTeam = $red.find('a').text();
    var redScore = $red.find('.score').data('score') || 0;

    var $blue = $match.find('.world.blue');
    var blueTeam = $blue.find('a').text();
    var blueScore = $blue.find('.score').data('score') || 0;

    var $green = $match.find('.world.green');
    var greenTeam = $green.find('a').text();
    var greenScore = $green.find('.score').data('score') || 0;

    var chartData = google.visualization.arrayToDataTable([
        ['Team', 'Score'],
        [redTeam, redScore],
        [blueTeam, blueScore],
        [greenTeam, greenScore],
    ]);

    new google.visualization.PieChart(
        document.getElementById('pie'+matchId)
    ).draw(chartData, chartOptions);
}
;


/*!
*
*   APP.TRACKER
*
*/


function trackerEvents(message){
    if(message.event){
        if (message.event === 'updateScore') {
            trackerUpdateScore(message);
        }
        else if (message.event === 'newOwner' || message.event === 'newClaimer' || message.event === 'dropClaimer') {
            var eventArgs = message.arguments;
            var team = eventArgs.owner;
            var timestamp = eventArgs.timestamp;

            if (message.event === 'newOwner') {
                console.log(window.gw2data.state[eventArgs.objectiveId]);

                window.gw2data.state[eventArgs.objectiveId].owner = {
                    "color": team,
                    "timestamp": timestamp,
                };

                trackerUpdateOwner(eventArgs.objectiveId);
                //FIXME trackerAppendToLog(objective, team, timestamp, message.event);
            }
        }
    }
}


function onInterval(intervalTime){
    var startTime = Date.now();
    //console.log('onInterval()', startTime);

    async.parallel([
        updateBuffTimers,
        updateLogEntries,
    ], function(err){
        //console.log('onInterval() completed', Date.now() - startTime);
        setTimeout(onInterval, intervalTime);
    });
};;


/*!
*
*   APP.TRACKER.SCOREBOARD
*
*/



function trackerUpdateScore(message){
    var eventArgs = message.arguments;
    console.log('update match scores', eventArgs.scores);

    async.each(
        $('#scoreBoards').find('.teamScoreBoard'),
        function(scoreBoard, nextScoreBoard){
            var $scoreBoard = $(scoreBoard);
            var worldIndex = $scoreBoard.data('worldindex');
            var score = Humanize.intcomma(eventArgs.scores[worldIndex]);
        
            $scoreBoard.find('.score').text(score)

            nextScoreBoard(null);
        },
        _.noop
    );
};


/*!
*
*   APP.TRACKER.OBJECTIVES
*
*/


function updateBuffTimers(callback){
    var buffTimer = 5*60;
    var now = Math.floor(Date.now() / 1000);

    async.each(
         $tracker.find('.objective'),
         function(objective, nextObjective){
            var $objective = $(objective);
            var lastCaptured = $objective.data('lastcaptured');
            var timeHeld = now - lastCaptured;

            if(timeHeld < buffTimer){
                $objective.find('.timer').show().html(minuteFormat(buffTimer - timeHeld))
            }
            else{
                $objective.find('.timer:visible').text('').hide();
                //$objective.find('.timer').html('<small>+' + Humanize.naturalTime(timeHeld*1000) + '</small>')
            }

            nextObjective(null)
         },
         function(err){
            callback(err);
         }
    );
};

function updateLogEntries(callback){
    async.each(
        $('#logEntries .logEntry'),
        function(logEntry, nextEntry){
            var $logEntry = $(logEntry);
            var intTimestamp = $logEntry.data('timestamp');
            var dateObj = new Date(intTimestamp*1000);
            var strTimestamp = dateFormat(dateObj, 'hh:MM:ss');
            var timetext = Humanize.naturalTime(intTimestamp)

            $logEntry.find('.timestamp').html(strTimestamp);
            $logEntry.find('.timetext').html(timetext);

            nextEntry(null);
        },
        function(err){
            callback(err);
        }
    )
}

function trackerUpdateOwner(objectiveId){
    console.log(window.gw2data.objectives)

    const objective = window.gw2data.objectives[objectiveId];
    console.log('trackerUpdateOwner()', objective)

    const objectiveState = window.gw2data.state[objectiveId];
    console.log('trackerUpdateOwner()', objectiveState)

    console.log('update objective owner', objective.commonNames[urlLang], objectiveState.owner.color);


    // const teamColor = objectiveState.owner.color.toLowerCase();
    // const timestamp = objectiveState.owner.timestamp;
    // const $sprite = $objective.find('.sprite');

    // let $objective = $('#objective-' + objectiveId);

    // console.log('update objective owner', objective.commonNames[urlLang], team);


    // $objective
    //     .removeClass('red green blue neutral')
    //     .addClass(teamColor)
    //     .data('lastcaptured', objectiveState.owner.timestamp)

    // $sprite
    //     .removeClass('red green blue neutral')
    //     .addClass(teamColor)
};


/*!
*
*   APP.TRACKER.LOG
*
*/

function initLog($log){
    console.log('initLog()');

    trackerLogRestripe();

    $log.find('.logEntry')
        .on('mouseenter', function(){
            var $that = $(this);
            var objectiveId = $that.data('objectiveid');
            var $objective = $('#objective-' + objectiveId);
            $objective.addClass('active');
        })
        .on('mouseout', function(){
            var $that = $(this);
            var objectiveId = $that.data('objectiveid');
            var $objective = $('#objective-' + objectiveId);
            $objective.removeClass('active');
        });

    $log.find('#logtabs a')
        .on('click', function(e){
            e.preventDefault();
            var $that = $(this);
            var mapName = $that.data('mapname');

            $that.closest('li')
                .addClass('active')
                .siblings()
                    .removeClass('active');

            if(mapName === 'All'){
                $log
                    .find('.logEntry:hidden')
                        .show()
                    .end();
            }
            else{
                $log
                    .find('.logEntry:not(.' + mapName + ')')
                        .hide()
                    .end()
                    .find('.logEntry.' + mapName)
                        .show()
                    .end();
            }

            trackerLogRestripe();
        });
}


function trackerAppendToLog(objective, team, timestamp, eventType, guildId){
    var objectiveType = window.gw2data.objectiveTypes[objective.type];
    var objectiveGroup = window.gw2data.objectiveGroups[objective.id]
    var teamColor = team.toLowerCase();

    if(objectiveType.timer){
        var activeMap = $('#logtabs li.active a').data('mapname');

        var $icon = $('<span>',{
            "class": [
                'sprite',
                objectiveType.type,
                teamColor,
            ].join(' ')
        });

        var $logEntry = $('<div>', {
                "class": [
                    'logEntry', 
                    'team', 
                    'clearfix', 
                    teamColor,
                    objectiveGroup.mapName,
                ].join(' '),
                "data":{
                    'timestamp': timestamp,
                    'mapname': '',
                    'objectiveid': objective.id,
                },
            })
            .append($('<div>', {"class": "logCol timestamp"}))
            .append($('<div>', {"class": "logCol timetext"}))
            .append($('<div>', {"class": "logCol logSprite"}).append($icon))
            .append($('<div>', {"class": "logCol objName", "text": objective.commonNames[urlLang]}))
            .append($('<div>', {"class": "logCol mapName", text: objectiveGroup.mapName}))
            .append($('<div>', {"class": "logCol details", "text": team}))
            .hide();


        $logEntry
            .prependTo('#logEntries')

        if(activeMap === 'All' || activeMap === objectiveGroup.mapName){
            $logEntry.slideDown('slow');
            trackerLogRestripe();
        }

    }

}

function trackerLogRestripe(){
    console.log('restriping');

    $('#logEntries .logEntry')
        .removeClass('alt')
        // .filter(':visible').each(function(i){
        //     if(i%2){
        //         $(this).addClass('alt');
        //     }
        // })
        .filter(':visible:even').addClass('alt');
}