
/*!
*
*   APP.TRACKER.OBJECTIVES
*
*/
(function(modules){
	"use strict"


	/*
	*
	*   DEFINE "EXPORT"
	*/

	var trackerObjectives = {};
	modules.trackerObjectives = trackerObjectives;



	/*
	*
	*   PRIVATE PROPERTIES
	*
	*/

	var __INSTANCE = {};
	var $objectives;



	/*
	*
	*   DOM INIT
	*
	*/

	$(function(){
		$objectives = $('#objectives').find('.objective');

		if($objectives.length){
	        setInterval(updateBuffTimers, 1000/3);

			window.modules.ws.addListener('newOwner', onNewOwner);
			window.modules.ws.addListener('newClaimer', onNewClaimer);
			window.modules.ws.addListener('dropClaimer', onDropClaimer);
		}
	});



	/*
	*
	*   PUBLIC METHODS
	*
	*/

	var $getObjective = trackerObjectives.$getObjective = _.memoize(function(objectiveId){
		return $objectives.filter('#objective-' + objectiveId);
	});


	

	/*
	*
	*   PRIVATE METHODS
	*
	*/

	function updateBuffTimers(updateDone){
		var buffTimer = 5*60;
		var now = Math.floor(Date.now() / 1000);

		async.each(
			$objectives,
			function(objective, nextObjective){
				var $objective = $(objective);
				var lastCaptured = $objective.data('timestamp');
				var timeHeld = now - lastCaptured;

				if(timeHeld < buffTimer){
					var formattedTime = window.modules.util.minuteFormat((buffTimer - timeHeld) - serverTimeOffset);
					$objective.find('.timer')
						.show()
						.html(formattedTime)
				}
				else{
					$objective.find('.timer:visible')
						.hide()
						.text('')
					//$objective.find('.timer').html('<small>+' + Humanize.naturalTime(timeHeld*1000) + '</small>')
				}

				nextObjective(null)
			},
	        _.noop
		);
	};



	function setOwner(objectiveId){
		var objective = window.gw2data.objectives[objectiveId];
		var objectiveState = window.gw2data.state[objectiveId];

		var teamColor = objectiveState.owner.color.toLowerCase();
		var timestamp = objectiveState.owner.timestamp;

		console.log('UPDATE :: New objective owner', objective.commonNames[urlLang], objectiveState.owner, objectiveState.guild);

		$getObjective(objectiveId)
			.removeClass('red green blue neutral')
			.addClass(teamColor)
			.data('timestamp', timestamp)
			.find('.sprite')
				.removeClass('red green blue neutral')
				.addClass(teamColor)
			.end()
	}



	function setClaimer(objectiveId){
		var objective = window.gw2data.objectives[objectiveId];
		var objectiveState = window.gw2data.state[objectiveId];


		if(objectiveState.guild.id){
			console.log('UPDATE :: New objective claimer', objective.commonNames[urlLang], objectiveState.owner, objectiveState.guild);

			var $guild = $('<abbr>', {
				"class": "guild",
				"data": {
					"guild": objectiveState.guild.id
				},
				"text": "Loading...",
			})

			$getObjective(objectiveId)
				.append($guild);

			window.modules.guilds.setGuild($guild);
		}
	}



	function removeClaimer(objectiveId){
		var objective = window.gw2data.objectives[objectiveId];
		var objectiveState = window.gw2data.state[objectiveId];
		var $objective = $getObjective(objectiveId);

		var hasGuild = !!(($objective.find('.guild').length) || $objective.data('guild'));
		var isSameGuild = hasGuild && ($objective.data('guild') === objectiveState.guild.id)

		if(hasGuild && !isSameGuild){
			console.log('UPDATE :: Remove objective claimer', objective.commonNames[urlLang], objectiveState.owner, objectiveState.guild);

			$objective
				.find('.guild')
					.remove()
				.end()
				.data('guild', null);
		}
	}

	

	/*
	*   WS Events
	*/

	function onNewOwner(message){
		var eventArgs = message.arguments;
		
		window.gw2data.state[eventArgs.objectiveId].owner = {
			"color": eventArgs.owner,
			"timestamp": eventArgs.timestamp,
		};

		async.series([
			function(next){
				setOwner(eventArgs.objectiveId);
				next(null);
			},
			function(next){
				removeClaimer(eventArgs.objectiveId);
				next(null);
			},
			function(next){
				setClaimer(eventArgs.objectiveId);
				next(null);
			},
		]);
	}



	function onNewClaimer(message){
		var eventArgs = message.arguments;

		window.gw2data.state[eventArgs.objectiveId].guild = {
			"id": eventArgs.guild,
			"timestamp": eventArgs.timestamp,
		};

		setClaimer(eventArgs.objectiveId)
	}



	function onDropClaimer(message){
		var eventArgs = message.arguments;

		window.gw2data.state[eventArgs.objectiveId].guild = {};

		removeClaimer(eventArgs.objectiveId)
	}



}(window.modules));