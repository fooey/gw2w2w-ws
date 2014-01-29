
/*!
*
*   APP.TRACKER.LOG
*
*/

(function(modules){
    "use strict"


    /*
    *
    *   DEFINE "EXPORT"
    */

    var trackerLog = {};
    modules.trackerLog = trackerLog;



    /*
    *
    *   PRIVATE PROPERTIES
    *
    */

    var __INSTANCE = {};
    var $log, $logEntries, $logtabs;



    /*
    *
    *   DOM INIT
    *
    */

	$(function(){
	    $log = $('#log');
	    $logEntries = $('#logEntries');
	    $logtabs = $('#logtabs')

	    if($log.length){
	        init();
			restripe();

	        setInterval(updateEntries, 1000/3);

        	window.modules.ws.addListener('newOwner', newOwner);
        	window.modules.ws.addListener('newClaimer', newClaimer);
        	window.modules.ws.addListener('dropClaimer', dropClaimer);
	    };
	});



    /*
    *
    *   PUBLIC METHODS
    *
    */

    

    /*
    *
    *   PRIVATE METHODS
    *
    */

	function append(objectiveId, eventType, $logDetail){
		var objective = window.gw2data.objectives[objectiveId];
		var objectiveType = window.gw2data.objectiveTypes[objective.type];

		if(!objectiveType.timer){
			return;
		}

		var objectiveState = window.gw2data.state[objectiveId];
		var objectiveGroup = window.gw2data.objectiveGroups[objectiveId];

		var teamColor = objectiveState.owner.color.toLowerCase();
		var timestamp = objectiveState.owner.timestamp;
		var activeMap = $logtabs.find('li.active a').data('mapname');

		var $icon = generateIcon(objectiveType.type, teamColor);

		var $logEntry = $('<div>', {
				"class": [
					'logEntry', 
					'team', 
					'clearfix', 
					teamColor,
					objectiveGroup.mapName,
					'objective-' + objectiveId
				].join(' '),
				"data":{
					'timestamp': timestamp,
					'objectiveid': objective.id,
					'mapname': '',
				},
			})
			// .append($('<div>', {"class": "logCol timestamp"}))
			.append($('<div>', {"class": "logCol timetext"}))
			.append($('<div>', {"class": "logCol logSprite"}).append($icon))
			.append($('<div>', {"class": "logCol objName", "text": objective.commonNames[urlLang]}))
			.append($('<div>', {"class": "logCol mapName", text: objectiveGroup.mapName}))
			.append($('<div>', {"class": "logCol details"}).append($logDetail))
			.hide();


		$logEntry
			.prependTo($logEntries)

		if(activeMap === 'All' || activeMap === objectiveGroup.mapName){
			$logEntry.slideDown();
			restripe();
		}
	}
	

	function generateIcon(objectiveType, teamColor){
		return $('<span>',{
			"class": [
				'sprite',
				objectiveType,
				teamColor,
			].join(' ')
		});
	}



	function restripe(){
		//console.log('restriping');
		$logEntries.find('.logEntry')
			.removeClass('alt')
			.filter(':visible:even').addClass('alt');
	}



	function removeEntries(selector){
		$logEntries.find(selector).slideUp(function(){
			$(this).remove();
		});
	}


	function updateEntries(updateDone){
		var entries = $logEntries.find('.logEntry');
	    async.each(
	        entries,
	        function(logEntry, nextEntry){
	            var $logEntry = $(logEntry);
	            var intTimestamp = $logEntry.data('timestamp') - serverTimeOffset;
	            var dateObj = new Date(intTimestamp*1000);
	            var strTimestamp = window.modules.util.dateFormat(dateObj, 'hh:MM:ss');
	            var timetext = Humanize.naturalTime(intTimestamp)

	            // $logEntry.find('.timestamp').html(strTimestamp).attr('title', timetext);
	            $logEntry.find('.timetext').html(timetext).attr('title', strTimestamp);

	            nextEntry(null);
	        },
	        _.noop
	    )
	}



    /*
    *	BEHAVIORAL
    */

	function init(){
		$log.on('mouseenter', '.logEntry', onEntryEnter)
			.on('mouseleave', '.logEntry', onEntryLeave);
		$logtabs.on('click', 'a', onTabClick);
	}
	

	function onEntryEnter(e){
		var $that = $(this);
		var objectiveId = $that.data('objectiveid');
		var $objective = window.modules.trackerObjectives.$getObjective(objectiveId);
		$objective.addClass('active');
	}
	

	function onEntryLeave(e){
		var $that = $(this);
		var objectiveId = $that.data('objectiveid');
		var $objective = window.modules.trackerObjectives.$getObjective(objectiveId);
		$objective.removeClass('active');
	}
	

	function onTabClick(e){
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

		restripe();
	}

    

    /*
    *   WS Events
    */

    function newOwner(message){
        var eventArgs = message.arguments;

		removeEntries('.objective-' + eventArgs.objectiveId);

		var $logDetail = $('<span>', {"text": 'newOwner: ' + eventArgs.owner});
        append(eventArgs.objectiveId, message.event, $logDetail);
    }

	function newClaimer(message){
		var eventArgs = message.arguments;

		removeEntries('.claimer.objective-' + eventArgs.objectiveId);

		var $guild = $('<span>', {
			"class": "guild guildFull",
			"data": {
				"guild": eventArgs.guild
			},
			"text": eventArgs.guild
		});

		var $logDetail = $('<span>', {
			"text": 'newClaimer: '
		}).append($guild);

		// console.log('newClaimer $guild', $guild, $guild.data('guild'));

		append(eventArgs.objectiveId, message.event, $logDetail);
	}

	function dropClaimer(message){
		var eventArgs = message.arguments;

		removeEntries('.claimer.objective-' + eventArgs.objectiveId);

		var $logDetail = $('<span>', {"text": 'removeClaimer: ' + eventArgs.objectiveId});
		append(eventArgs.objectiveId, message.event, $logDetail);
	}



}(window.modules));