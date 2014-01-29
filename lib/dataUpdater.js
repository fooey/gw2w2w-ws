"use strict"

const _  = require('lodash');
const async = require('async');

const anet = require('./anet');
const myUtil = require('./util');


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
    // initData(function(){
        __callUpdaters(callback)
    // });
}



/*
*
*   PRIVATE METHODS
*
*/

// const initData = function (initDataCallback){
//     console.log(Date.now(), 'Initializing Data Handler')
//     async.parallel([
//         initGlobals
//     ] , function(err, data){
//         initDataCallback();
//     });
// }



const __callUpdaters = function(callUpdatersCallback){
    const startTime = Date.now();
    console.log(startTime, 'Updating Data')

    try{
        async.parallel([
            __updateWorlds,
            __updateObjectives,
            __updateMatches
        ], function(err, data){
            if(err)throw(err);

            __updateMatchDetails(function(){
                __finalizeUpdate(startTime, callUpdatersCallback)
            })
        });
    }
    catch(err){
        console.log('ERR IN __callUpdaters()', err)
        __finalizeUpdate(startTime, callUpdatersCallback)
        if(callUpdatersCallback) callUpdatersCallback();
    }
}



const __finalizeUpdate = function(startTime, finalizeUpdateCallback){
    const finishTime = Date.now();
    const refreshTime = _.random(1.5*1000, 2.5*1000);

    __isDataReady(function(isReady){

        if(!isReady){
            console.log(Date.now(), 'Data NOT Ready, Broadcast DESYNC Event')
            GLOBAL.WebSocketServer.broadcastToChannel('global', {event: 'desync'});
        }
        else if(isReady && !GLOBAL.dataReady){
            console.log(Date.now(), 'Data Ready, Broadcast RESYNC Event')
            GLOBAL.WebSocketServer.broadcastToChannel('global', {event: 'resync'});
        }

        GLOBAL.dataReady = isReady;

        console.log(
            finishTime,
            'Updating Data Completed',
            'Elapsed: ', finishTime - startTime,
            'Next: ', refreshTime
        );

        setTimeout(__callUpdaters, refreshTime);
        if(finalizeUpdateCallback) finalizeUpdateCallback();
    });

}



// const initGlobals = function(callback){
//     //console.log('Initialiaze Globals')
//     //GLOBAL.data = {};
//     callback();
// }



const __isDataReady = function(isReadyCallback){
    const notReady = function(){
        isReadyCallback(false)
    };

    const onWorldsReady = function(){
        require('./objectives').isReady(onObjectivesReady, notReady);
    };

    const onObjectivesReady = function(){
        require('./objectives').isReady(onMatchesReady, notReady);
    };

    const onMatchesReady = function(){
        require('./matches').isReady(function(){
            isReadyCallback(true)
        }, notReady);
    };



    require('./worlds').isReady(onWorldsReady, notReady);
};



const __updateWorlds = function (updateDone) {
    require('./worlds').updateFromRemote(updateDone);
};

const __updateObjectives = function (updateDone) {
    require('./objectives').updateFromRemote(updateDone);
};

const __updateMatches = function (updateDone) {
    require('./matches').updateFromRemote(updateDone);
};

const __updateMatchDetails = function (updateDone) {
    require('./matchDetails').updateFromRemote(updateDone);
};