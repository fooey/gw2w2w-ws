"use strict"

const async = require('async');
const _ = require('lodash');


module.exports = function (req, res) {
    const urlLang = req.params.lang || 'en';
    const renderStart = Date.now();

    if(!GLOBAL.dataReady){        
        require('./loading.js')(req, res);
    }
    else{

        async.auto({
            worlds: getWorlds,
            scores: getScores,
            matches: ['worlds', 'scores', getMatches],
            worldLists: ['worlds', buildWorldLists],
            matchLists: ['matches', buildMatchLists],
        }
        , function (err, results){
            if(err){console.log('ERROR IN overview.renderView()', err)}

            res.render('overview', {
                title: 'GuildWars2 WvW Objectives Tracker',

                langs: require('../lib/anet.js').langs,
                urlLang: urlLang,

                worlds: results.worlds,
                matches: results.matches,

                worldLists: results.worldLists,
                matchLists: results.matchLists,

                renderStart: renderStart,
            });
        });



        /*
        *   ASYNC.AUTO METHODS
        */

        function getWorlds(autoCallback){
            require('../lib/worlds.js').getWorlds(autoCallback)
        }


        function getScores(autoCallback){
            require('../lib/matchDetails.js').getScores(autoCallback);
        }


        function getMatches(autoCallback, autoData){
            const humanize = require('humanize');

            require('../lib/matches.js').getMatches(function(err, matches){
                async.each(
                    Object.keys(matches),
                    function(matchId, nextMatch){
                        let match = matches[matchId];
                        
                        match.redWorld = autoData.worlds[match.redWorldId];
                        match.greenWorld = autoData.worlds[match.greenWorldId];
                        match.blueWorld = autoData.worlds[match.blueWorldId];
                        match.scores = (autoData.scores) ? autoData.scores[match.id] : [0,0,0];
                        match.scoresFormatted = _.map(match.scores, function(score) { return humanize.numberFormat(score, 0); });

                        nextMatch(null);
                    },
                    function(err){
                        autoCallback(null, matches);
                    }
                );
            });
        }


        function buildWorldLists(autoCallback, autoData){
            autoCallback(null, {
                'US': getSortedWorldsByRegion('US', autoData.worlds),
                'EU': getSortedWorldsByRegion('EU', autoData.worlds),
            });
        }


        function buildMatchLists(autoCallback, autoData){
            autoCallback(null, {
                'US': getSortedMatchesByRegion('US', autoData.matches),
                'EU': getSortedMatchesByRegion('EU', autoData.matches),
            });
        }
        


        /*
        *   UTIL METHODS
        */

        function getSortedWorldsByRegion(region, worlds){
            return _.pluck(_.sortBy(_.filter(worlds, {region: region}), function(world){return world[urlLang].name}), 'id');
        }

        function getSortedMatchesByRegion(region, matches){
            return _.pluck(_.filter(matches, {region: region}), 'id').sort();
        }

    }
};