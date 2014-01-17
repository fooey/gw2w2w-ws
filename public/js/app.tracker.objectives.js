
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
			window.modules.ws.addListener('newClaimer', onNweClaimer);
			window.modules.ws.addListener('dropClaimer', onDropClaimer);
		}
	});



	/*
	*
	*   PUBLIC METHODS
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
					var formattedTime = window.modules.util.minuteFormat(buffTimer - timeHeld);
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


	

	/*
	*
	*   PRIVATE METHODS
	*
	*/

	function $getObjective(objectiveId){
		return $('#objective-' + objectiveId);
	}


	function setOwner(objectiveId){
		var objective = window.gw2data.objectives[objectiveId];
		var objectiveState = window.gw2data.state[objectiveId];

		var teamColor = objectiveState.owner.color.toLowerCase();
		var timestamp = objectiveState.owner.timestamp;

		console.log('update objective owner', objective.commonNames[urlLang], objectiveState.owner.color);

		$getObjective(objectiveId)
			.removeClass('red green blue neutral')
			.addClass(teamColor)
			.data('timestamp', timestamp)
			.data('guild', objectiveState.guild.id)
			.find('.sprite')
				.removeClass('red green blue neutral')
				.addClass(teamColor)
			.end()
	}



	function setClaimer(objectiveId){
		var objective = window.gw2data.objectives[objectiveId];
		var objectiveState = window.gw2data.state[objectiveId];

		$getObjective(objectiveId)
			.data('guild', objectiveState.guild.id);
	}



	function removeClaimer(objectiveId){
		var objective = window.gw2data.objectives[objectiveId];

		$getObjective(objectiveId)
			.data('guild', '');
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

		setOwner(eventArgs.objectiveId);
	}



	function onNweClaimer(message){
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