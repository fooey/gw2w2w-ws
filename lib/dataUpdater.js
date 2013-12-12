"use strict"

const path = require('path');

const _  = require('lodash');
const async = require('async');

const anet = require(path.join(process.cwd(), 'lib/anet'));
const myUtil = require(path.join(process.cwd(), 'lib/util'));


/*
*
*   DEFINE EXPORT
*
*/
var DataUpdater = {};
module.exports = DataUpdater;



/*
*
*   PUBLIC METHODS
*
*/

DataUpdater.startUpdater = function (callback) {
    initData(function(){
        callUpdaters(callback)
    });
}



/*
*
*   PRIVATE METHODS
*
*/

const initData = function (initDataCallback){
    console.log('Initializing Data Handler')
    async.parallel([
        initGlobals
    ] , function(err, data){
        GLOBAL.data.initialized = myUtil.now();
        initDataCallback();
    });
}



const callUpdaters = function(callUpdatersCallback){
    const startTime = _.now();
    console.log(startTime, 'Updating Data')

    try{
        async.parallel([
            updateWorlds,
            updateObjectives,
            updateMatches
        ], function(err, data){
            if(err)throw(err);

            updateMatchDetails(function(){
                finalizeUpdate(startTime, callUpdatersCallback)
            })
        });
    }
    catch(err){
        setTimeout(callUpdaters, refreshTime);
        if(callUpdatersCallback) callUpdatersCallback();
    }
}



const finalizeUpdate = function(startTime, finalizeUpdateCallback){
    const finishTime = _.now();
    const refreshTime = _.random(2*1000, 4*1000);


    if(!isDataReady()){
        GLOBAL.wssHandler.broadcastToChannel('global', {event: 'desync'});
    }
    else if(isDataReady() && !GLOBAL.isDataReady){
        GLOBAL.wssHandler.broadcastToChannel('global', {event: 'resync'});
    }

    GLOBAL.dataReady = isDataReady();

    console.log(
        finishTime,
        'Updating Data Completed',
        'Elapsed: ', finishTime - startTime,
        'Next: ', refreshTime
    );

    setTimeout(callUpdaters, refreshTime);
    if(finalizeUpdateCallback) finalizeUpdateCallback();

}



const initGlobals = function(callback){
    console.log('Initialiaze Globals')
    GLOBAL.data = {
        worlds: {},
        objectives: {},
        matches: {},
        matchDetails: {},
        matchDetailsPREV: {},
        objectiveState: {}
    };
    callback();
}



const isDataReady = function(){
    return (isWorldsReady() && isObjectivesReady() && isMatchesReady());
};



const isWorldsReady = function(){
    const expected = 51;
    const current = (GLOBAL.data.worlds['en']) ? GLOBAL.data.worlds['en'].length : 0;
    return !!(current >= expected);
};



const isObjectivesReady = function(){
    const expected = 76;
    const current = (GLOBAL.data.objectives.length) ? GLOBAL.data.objectives.length : 0;
    return !!(current >= expected);
};



const isMatchesReady = function(){
    const expected = 17;
    const current = (GLOBAL.data.matches.length) ? GLOBAL.data.matches.length : 0;
    return !!(current >= expected);
};



const updateWorlds = function (updateWorldsCallback) {
    const worldsController = require(path.join(process.cwd(), 'lib/worlds'));
    
    if(!isWorldsReady()){
        console.log(_.now(), 'updateWorlds()')
        async.concat(
            anet.getLangs(),
            function(lang, callback){
                anet.getWorlds(lang.key, function(data){
                    callback(null, {lang: lang.key, data: data});
                })
            },
            function(err, worldsDataConcat){
                if(err){ throw(err) }
                worldsController.store(worldsDataConcat, function(){
                    if(isWorldsReady()){
                        console.log(_.now(), 'updateWorlds() complete')
                    }
                    updateWorldsCallback();
                });
            }
        )
    }
    else{
        updateWorldsCallback();
    }
}




const updateObjectives = function (updateObjectivesCallback) {
    const objectivesController = require(path.join(process.cwd(), 'lib/objectives'));

    if(!isObjectivesReady()){
        console.log(_.now(), 'updateObjectives()')
        anet.getObjectives('en', function(data){
            objectivesController.store(data, function(){
                if(isObjectivesReady()){
                    console.log(_.now(), 'updateObjectives() complete')
                }
                updateObjectivesCallback();
            });
        })
    }
    else{
        updateObjectivesCallback();
    }
};



const updateMatches = function (updateMatchesCallback) {
    const matchesController = require(path.join(process.cwd(), 'lib/matches'));

    if(!isMatchesReady()){
        console.log(_.now(), 'updateMatches()')
        anet.getMatches(function(data){
            matchesController.store(data, function(){
                if(isMatchesReady()){
                    console.log(_.now(), 'updateMatches() complete')
                }
                updateMatchesCallback();
            });
        })
    }
    else{
        updateMatchesCallback();
    }
};



const updateMatchDetails = function (updateMatchDetailsCallback) {
    const matchDetailsController = require(path.join(process.cwd(), 'lib/matchDetails'));

    //console.log('updateMatchDetails()');
    if(isMatchesReady()){
        async.each(
            Object.keys(GLOBAL.data.matches),
            function(matchId, callback){
                const match = GLOBAL.data.matches[matchId];
                anet.getMatchDetails(match.getId(), function(data){
                    matchDetailsController.store(match.getId(), data, function(){
                        callback(null);
                    });
                })
            },
            function(err){
                if(err)throw(err);
                matchDetailsController.findUpdates(function(){
                    updateMatchDetailsCallback()
                });
            }
        )
    }
    else{
        updateMatchDetailsCallback();
    }
};