
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
		$objectives = $('#objectives').find('.objectives');
		if($objectives.length){
	        setInterval(updateBuffTimers, 1000/3);

			window.modules.ws.addListener('newOwner', newOwner);
			window.modules.ws.addListener('newClaimer', newClaimer);
			window.modules.ws.addListener('dropClaimer', dropClaimer);
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
				var lastCaptured = $objective.data('lastcaptured');
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


	function trackerUpdateOwner(objectiveId){
		var objective = window.gw2data.objectives[objectiveId];
		var objectiveState = window.gw2data.state[objectiveId];

		var teamColor = objectiveState.owner.color.toLowerCase();
		var timestamp = objectiveState.owner.timestamp;

		var $objective = $('#objective-' + objectiveId);
		var $sprite = $objective.find('.sprite');

		console.log('update objective owner', objective.commonNames[urlLang], objectiveState.owner.color);


		$objective
			.removeClass('red green blue neutral')
			.addClass(teamColor)
			.data('lastcaptured', timestamp)

		$sprite
			.removeClass('red green blue neutral')
			.addClass(teamColor)
	}

	

	/*
	*   WS Events
	*/

	function newOwner(message){
		var eventArgs = message.arguments;
		
		window.gw2data.state[eventArgs.objectiveId].owner = {
			"color": eventArgs.owner,
			"timestamp": eventArgs.timestamp,
		};

		trackerUpdateOwner(eventArgs.objectiveId);
	}

	function newClaimer(message){
		var eventArgs = message.arguments;

		window.gw2data.state[eventArgs.objectiveId].guild = {
			"id": eventArgs.guild,
			"timestamp": eventArgs.timestamp,
		};

		//FIXME
	}

	function dropClaimer(message){
		var eventArgs = message.arguments;

		window.gw2data.state[eventArgs.objectiveId].guild = {};


		//FIXME
	}



}(window.modules));