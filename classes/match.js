"use strict"

const path = require('path');

const _ = require('lodash');

const worldsController = require(path.join(process.cwd(), 'lib/worlds'));
const matchDetailsController = require(path.join(process.cwd(), 'lib/matchDetails'));


function Match(parameters) {
    let obj = this;


    /*
    *
    *  PROPERTIES
    *
    */
    const __INSTANCE = {
        id: parameters.wvw_match_id,
        startTime: new Date(parameters.start_time),
        endTime: new Date(parameters.end_time),
    
        redWorldId: parseInt(parameters.red_world_id),
        blueWorldId: parseInt(parameters.blue_world_id),
        greenWorldId: parseInt(parameters.green_world_id),

        //region, redWorld, blueWorld, greenWorld
    }



    /*
    *
    *  PUBLIC GETTERS
    *
    */

    obj.getId = function(){return __INSTANCE.id;}
    obj.getStartTime = function(){return __INSTANCE.startTime;}
    obj.getEndTime = function(){return __INSTANCE.endTime;}


    obj.getRegion = _.memoize(function(){
        if(obj.getId().charAt(0) ===  '1') return 'US';
        if(obj.getId().charAt(0) ===  '2') return 'EU';
    });

    obj.getRedWorld = _.memoize(function(lang){
        return worldsController.getWorldById(lang, __INSTANCE.redWorldId);
    });
    
    obj.getGreenWorld = _.memoize(function(lang){
        return worldsController.getWorldById(lang, __INSTANCE.greenWorldId);
    });
    
    obj.getBlueWorld = _.memoize(function(lang){
        return worldsController.getWorldById(lang, __INSTANCE.blueWorldId);
    });

    obj.getScores = _.memoize(function(){
        return matchDetailsController.getMatchDetails(obj.getId()).getScores();
    });
};

module.exports = Match;





