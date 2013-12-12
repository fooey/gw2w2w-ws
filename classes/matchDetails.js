"use strict"

const path = require('path');

const _ = require('lodash');
const humanize = require('humanize');

const objectivesController = require(path.join(process.cwd(), 'lib/objectives'));

function MatchDetails (details) {
    let obj = this;



    /*
    *
    *  PROPERTIES
    *
    */
    const __INSTANCE = details;




    /*
    *
    *  GETTERS
    *
    */

    obj.getMatchId = function(){return __INSTANCE.match_id;}

    obj.getObjectives = function(){
        var matchObjectives = {};

        var _objectives = _.flatten(__INSTANCE.maps, 'objectives');
        _.forEach(_objectives, function(matchObjective, ix){
            matchObjective.objective = objectivesController.getById(matchObjective.id);
            matchObjectives[matchObjective.id] = matchObjective;
        });

        return matchObjectives;
    };


    obj.getScores = function(){
        return {
            numeric: __INSTANCE.scores,
            formatted: _.map(__INSTANCE.scores, function(score) { return humanize.numberFormat(score, 0); }),
        };
    };


    obj.getMapNames = function(lang){
        const matchesController = require(path.join(process.cwd(), 'lib/matches'))
        var match = matchesController.getById(obj.getMatchId());
        var mapNames = ['Eternal Battlegrounds'];
        _.forEach([match.getRedWorld(lang), match.getBlueWorld(lang), match.getGreenWorld(lang)], function(world, i){
            mapNames.push(world.getName() + ' Borderland');
        });

        return mapNames;
    };
};

module.exports = MatchDetails;




