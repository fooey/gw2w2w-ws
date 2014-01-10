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
        callUpdaters(callback)
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



const callUpdaters = function(callUpdatersCallback){
    const startTime = Date.now();
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
        console.log('ERR IN callUpdaters()', err)
        finalizeUpdate(startTime, callUpdatersCallback)
        if(callUpdatersCallback) callUpdatersCallback();
    }
}



const finalizeUpdate = function(startTime, finalizeUpdateCallback){
    const finishTime = Date.now();
    const refreshTime = _.random(2*1000, 4*1000);

    isDataReady(function(isReady){

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

        setTimeout(callUpdaters, refreshTime);
        if(finalizeUpdateCallback) finalizeUpdateCallback();
    });

}



// const initGlobals = function(callback){
//     //console.log('Initialiaze Globals')
//     //GLOBAL.data = {};
//     callback();
// }



const isDataReady = function(isReadyCallback){
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



const updateWorlds = function (updateDone) {
    require('./worlds').updateFromRemote(updateDone);
};

const updateObjectives = function (updateDone) {
    require('./objectives').updateFromRemote(updateDone);
};

const updateMatches = function (updateDone) {
    require('./matches').updateFromRemote(updateDone);
};

const updateMatchDetails = function (updateDone) {
    require('./matchDetails').updateFromRemote(updateDone);
};