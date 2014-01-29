"use strict"

const _ = require('lodash');
const async = require('async');

const anet = require('./anet');
const cache = require('./cache');



/*
*
*   DEFINE EXPORT
*
*/

let Controller = {};
module.exports = Controller;



/*
*
*   PUBLIC METHODS
*
*/




/*
*   REMOTE DATA
*/

Controller.updateFromRemote = function(guildId, updateDone){
	if(Array.isArray(guildId)){
		async.each(
			guildId,
			function(thisGuildId, nextGuildId){
				Controller.updateFromRemote(thisGuildId, nextGuildId);
			},
			updateDone
		)
	}
	else{
		const startTime = Date.now();
		Controller.isReady(
			guildId,
			updateDone,
			function onNotReady(){
				// console.log('getRemote guild', guildId)
				anet.getGuild(guildId, function(err, data){
					cache.write({type: 'guilds', subType: guildId}, data, updateDone);
				})
			}
		);
	}
};


Controller.getById = function(guildId, getterCallback){
	cache.read({type: 'guilds', subType: guildId}, getterCallback);
};


Controller.getByMatchId = function(matchId, getterCallback){
	require('../lib/matchDetails').getById(matchId, function(err, matchDetails){
		Controller.findMatchDetailGuilds(matchDetails, function(guilds){
			let guildsDetails = {};
			async.each(
				guilds,
				function(guildId, nextGuild){
					Controller.getById(guildId, function(err, guild){
						guildsDetails[guildId] = guild;
						nextGuild(null);
					});
				},
				function(err){
					getterCallback(null, guildsDetails);
				}
			);
		});
	});
};


Controller.findMatchDetailGuilds = function(matchDetails, onDone){
	let guilds = [];
	async.concat(
		matchDetails.maps,
		function(map, nextMap){
			guilds = _.pluck(map.objectives, 'owner_guild');
			nextMap(null, guilds);
		},
		function(err, guilds){
			guilds = _.without(_.uniq(guilds), undefined);
			onDone(guilds);
		}
	);
};


Controller.matchUpdateFromRemote = function(matchDetails, onDone){
	Controller.findMatchDetailGuilds(matchDetails, function(guilds){
		Controller.updateFromRemote(guilds, onDone);
	});
};



/*
*   INDIVIDUAL GETTERS
*/




/*
*   MASS GETTERS
*/


/*
*
*   UTILITY METHODS
*
*/



Controller.isReady = function(guildId, onReady, onNotReady){
	cache.isLocalFresh({type: 'guilds', subType: guildId}, onReady, onNotReady);
};


/*
*
*   PRIVATE METHODS
*
*/


