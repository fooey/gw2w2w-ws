"use strict"

const async = require('async');
const _ = require('lodash');
const humanize = require('humanize');



module.exports = function (req, res) {
    const urlLang = req.params.lang || 'en';
    const renderStart = _.now();

    if(!GLOBAL.dataReady){        
        require('./loading.js')(req, res);
    }
    else{

        const langs = require('../lib/anet.js').langs;
        const worldsController = require('../lib/worlds.js');
        const matchesController = require('../lib/matches.js');
        const matchDetailsController = require('../lib/matchDetails.js');

        async.parallel([
            getWorlds
            , getMatches
            , getScores
        ]
        , renderView);


        function getWorlds(getWorldsCallback){
        	let worlds = [];
            worldsController.asyncEach(
            	urlLang,
            	function(world, nextWorld){
                    world.link = worldsController.getLink(urlLang, world.slug);
                    worlds.push(world);
                    nextWorld(null);
                }
                , function(err){
                    getWorldsCallback(err, worlds);
                }
            );
        }

        function getMatches(getMatchesCallback){
            matchesController.getMatches(function(err, matches){
                getMatchesCallback(err, matches);
            });
        }

        function getScores(getScoresCallback){
            matchDetailsController.getScores(function(err, scores){
                getScoresCallback(err, scores);
            });
        }


        function renderView(err, results){
            if(err){console.log('ERROR IN overview.renderView()', err)}

            let allWorlds = results[0];
            let allMatches = results[1];
            let allScores = results[2];

            async.concat(
            	allMatches,
            	function(match, next){
	                match.redWorld = _.find(allWorlds, function(world){return world.id === match.redWorldId});
	                match.greenWorld = _.find(allWorlds, function(world){return world.id === match.greenWorldId});
	                match.blueWorld = _.find(allWorlds, function(world){return world.id === match.blueWorldId});
	                match.scores = _.find(allScores, function(matchScore){return matchScore.match_id === match.id}).scores;
	                match.scoresFormatted = _.map(match.scores, function(score) { return humanize.numberFormat(score, 0); });
	                next(null, match);
	            },
	            function(err, mergedMatches){
		            const worlds = {
		                'US': _.filter(allWorlds, function(world){return world.region === 'US'}),
		                'EU': _.filter(allWorlds, function(world){return world.region === 'EU'}),
		            };

		            const matches = {
		                'US': _.filter(mergedMatches, function(match){return match.region === 'US'}),
		                'EU': _.filter(mergedMatches, function(match){return match.region === 'EU'}),
		            };

                    console.log('matches: ', matches);


		            res.render('overview', {
		                title: 'GuildWars2 WvW Objectives Tracker',

		                langs: langs,

		                lang: urlLang,
		                matches: matches,
		                worlds: worlds,

		                renderStart: renderStart,
		            });
	            }
	        );
        }


    }
};