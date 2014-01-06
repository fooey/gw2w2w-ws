"use strict"

const async = require('async');
const _ = require('lodash');
const humanize = require('humanize');

const langs = require('../lib/anet.js').langs;


module.exports = function (req, res) {
    const urlLang = req.params.lang || 'en';
    const renderStart = Date.now();

    if(!GLOBAL.dataReady){        
        require('./loading.js')(req, res);
    }
    else{

        async.parallel([
            getWorlds
            , getMatches
            , getScores
        ]
        , renderView);



        function getWorlds(getWorldsCallback){
            require('../lib/worlds.js').getWorlds(getWorldsCallback)
        }

        function getMatches(getMatchesCallback){
            require('../lib/matches.js').getMatches(getMatchesCallback);
        }

        function getScores(getScoresCallback){
            require('../lib/matchDetails.js').getScores(getScoresCallback);
        }


        function renderView(err, results){
            if(err){console.log('ERROR IN overview.renderView()', err)}

            let worlds = results[0];
            let matches = results[1];
            let allScores = results[2];

            const worldLists = {
                'US': _.pluck(_.sortBy(_.filter(worlds, {region: 'US'}), function(world){return world[urlLang].name}), 'id'),
                'EU': _.pluck(_.sortBy(_.filter(worlds, {region: 'EU'}), function(world){return world.name}), 'id'),
            }

            const matchLists = {
                'US': _.pluck(_.filter(matches, {region: 'US'}), 'id').sort(),
                'EU': _.pluck(_.filter(matches, {region: 'EU'}), 'id').sort(),
            }

            const matchIds = Object.keys(matches);
            async.each(
            	matchIds,
            	function(matchId, nextMatch){
                    let match = matches[matchId]
                    
                    match.redWorld = worlds[match.redWorldId];
                    match.greenWorld = worlds[match.greenWorldId];
	                match.blueWorld = worlds[match.blueWorldId];
	                match.scores = (allScores) ? allScores[match.id] : [0,0,0];
	                match.scoresFormatted = _.map(match.scores, function(score) { return humanize.numberFormat(score, 0); });

	                nextMatch(null);
	            },
	            function(err){

		            res.render('overview', {
		                title: 'GuildWars2 WvW Objectives Tracker',

		                langs: langs,
		                urlLang: urlLang,

		                worlds: worlds,
                        matches: matches,

                        worldLists: worldLists,
                        matchLists: matchLists,

		                renderStart: renderStart,
		            });
	            }
	        );
        }


    }
};