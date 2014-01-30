
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
    var $guilds;



    /*
    *
    *   DOM INIT
    *
    */

	$(function(){
        $guilds = $('#guilds');
		_.defer(setPendingGuilds)
	});



    /*
    *
    *   PUBLIC METHODS
    *
    */



    var setPendingGuilds = guilds.setPendingGuilds = function($guild){
    	var guildsToSet = $('.guild:not(.guildSet)');

    	async.eachSeries(
    		guildsToSet,
    		function(guild, nextGuild){
    			setGuild($(guild));
    			nextGuild(null);
    		}, _.noop
    	);
    }


    var setGuild = guilds.setGuild = function($guild){
    	// console.log('$guild', $guild)

    	var guildId = $guild.data('guild');

    	if(!guildId){
    		console.log($guild, guildId)
    	}
    	else{
	    	var guildData = window.gw2data.guilds[guildId];


	    	if(guildData){
	    		$guild.addClass('guildSet')
                    .attr('href', '#' + guildId);


                var $guildInfo = $guilds.find('#' + guildId);
                if(!$guildInfo.length){
                    $guilds.find('ul').prepend(
                        $('<li>', {
                            "id": guildId
                        }).append(
                            $('<p>', {text: '[' + guildData.tag + '] ' + guildData.guild_name})
                        ).append(
                            $('<img>', {
                                src: '/emblems/256/' + guildId + '.svg',
                                css: {
                                    width: 128,
                                    height: 128,
                                }
                            })
                        ).hide()
                    );
                }
                else{
                    $guildInfo
                        .hide()
                        .detach()
                        .prependTo($guilds.find('ul'))
                        .slideDown()
                }

	    		if($guild.hasClass('guildFull')){
	    			$guild.text('[' + guildData.tag + '] ' + guildData.guild_name);
	    		}
	    		else{
	    			$guild.text(guildData.tag)
		    			.attr("title", guildData.guild_name);
	    		}
	    	}
	    	else{
	    		$guild.text('loading...');

		    	$.getJSON("/data/guild-" + guildId + ".json")
		    		.done(function(data, textStatus, jqXHR) {
		    			window.gw2data.guilds[guildId] = data;
		    			console.log('New Guild Data: ', $guild, data);
		    			setGuild($guild);
		    		})
		    		.fail(function( jqXHR, textStatus, errorThrown ) {
		    			console.log('Guild Data Failed: ', $guild, errorThrown);
		    			//setTimeout(function(){setGuild($guild);}, 1000)
		    		})
		    		// .always(function( data|jqXHR, textStatus, jqXHR|errorThrown ) { });
	    	}
	    }

    }

    

    /*
    *
    *   PRIVATE METHODS
    *
    */



}(window.modules));