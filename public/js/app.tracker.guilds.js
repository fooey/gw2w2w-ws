
/*!
*
*   APP.TRACKER.GUILDS
*
*/

(function(modules){
    "use strict"


    /*
    *
    *   DEFINE "EXPORT"
    */

    var guilds = {};
    modules.guilds = guilds;



    /*
    *
    *   PRIVATE PROPERTIES
    *
    */

    var __INSTANCE = {};



    /*
    *
    *   DOM INIT
    *
    */

	$(function(){
		$('#objectives').find('.objective').has('.guild').each(function(){
			var $that = $(this);
			setGuild($that.data('objectiveid'))
		});
			// window.modules.guilds.setGuild(objectiveId);
	});



    /*
    *
    *   PUBLIC METHODS
    *
    */

    var setGuild = guilds.setGuild = function(objectiveId){
    	var $objective = window.modules.trackerObjectives.$getObjective(objectiveId);
		var objective = window.gw2data.objectives[objectiveId];
		var objectiveState = window.gw2data.state[objectiveId];

    	var $guild = $objective.find('.guild');
    	var guildId = $objective.data('guild');

    	console.log(guildId)

    	//http://localhost:3000/data/guild-2D271EFA-F7F9-44A1-AAEB-5ED0024E9539.json
    	$.getJSON("/data/guild-" + guildId + ".json")
    		.done(function(data, textStatus, jqXHR) {
    			console.log(data);
    			$guild.text(data.tag).attr("title", data.guild_name);
    		})
    		// .fail(function( jqXHR, textStatus, errorThrown ) {})
    		// .always(function( data|jqXHR, textStatus, jqXHR|errorThrown ) { })

    	$guild.text();
    }

    

    /*
    *
    *   PRIVATE METHODS
    *
    */



}(window.modules));