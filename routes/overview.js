var humanize = require('humanize'),
    _ = require('lodash'),
    async = require('async'),
    path = require('path')

var myUtil = require(path.join(GLOBAL.appRoot, '/lib/util.js')),
    worldsController = require(path.join(GLOBAL.appRoot, '/lib/worlds.js')),
    matchesController = require(path.join(GLOBAL.appRoot, '/lib/matches.js')),
    anet = require(path.join(GLOBAL.appRoot, '/lib/anet.js'))


module.exports = function (req, res) {
    var lang = req.params.lang || 'en';
    


    var allWorlds = _.sortBy(GLOBAL.data.worlds[lang], function(world){return world.name});

    var worlds = {
        US: _.filter(allWorlds, function(world){ return world.region === 'US'; }),
        EU: _.filter(allWorlds, function(world){ return world.region === 'EU'; }),
    };

    var allMatches = _.sortBy(GLOBAL.data.matches, function(match){return match.id});
    var matches = {
        US: _.filter(allMatches, function(match){ return match.region === 'US'; }),
        EU: _.filter(allMatches, function(match){ return match.region === 'EU'; }),
    };


    var scores = {};
    _.forEach(GLOBAL.data.matchDetails, function(match, matchId){
        scores[matchId] = match.scores;
    });


    res.render('overview', {
        title: 'GuildWars2 WvW Objectives Tracker',
        langs: anet.langs,
        lang: lang,
        humanize: humanize,
        matches: matches,
        worlds: worlds,
        scores: scores
    });
};