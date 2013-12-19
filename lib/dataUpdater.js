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
        console.log('ERR IN callUpdaters()', err)
        finalizeUpdate(startTime, callUpdatersCallback)
        if(callUpdatersCallback) callUpdatersCallback();
    }
}



const finalizeUpdate = function(startTime, finalizeUpdateCallback){
    const finishTime = _.now();
    const refreshTime = _.random(2*1000, 4*1000);

    isDataReady(function(isReady){

        if(!isReady){
            console.log(_.now(), 'data not ready, inform of desync')
            GLOBAL.WebSocketServer.broadcastToChannel('global', {event: 'desync'});
        }
        else if(isReady && !GLOBAL.dataReady){
            console.log(_.now(), 'data now ready, inform clients of resync')
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



const isDataReady = function(isReadyCallback){
    async.every([
        require('./worlds'),
        require('./objectives'),
        require('./matches')
    ], function(controller, callback){
        callback(controller.isReady)
    }
    , isReadyCallback);
};



const updateWorlds = function (updateDone) {
    const worldsController = require('./worlds');

    worldsController.isReady(function(isWorldsReady){
        if(!isWorldsReady){
            console.log(_.now(), 'updateWorlds()');
            const langs = anet.langs;
            let worlds = [];

            async.each(
                langs,
                function(lang, langDone){
                    anet.getWorlds(lang.key, function(err, worldsData){
                        async.each(
                            worldsData
                            , function(world, worldDone){
                                world.lang = lang.key;
                                worlds.push(world);
                                worldDone();
                            }
                            , function(err){
                                langDone(null);
                            }
                        )
                    })
                },
                function(err){
                    if(err){ throw(err) }
                    worldsController.store(worlds, function(err, numWorlds){
                        if(isWorldsReady){
                            console.log(_.now(), 'updateWorlds() complete')
                        }
                        updateDone();
                    });
                }
            )
        }
        else{
            updateDone();
        }
    });

}




const updateObjectives = function (updateObjectivesCallback) {
    const objectivesController = require('./objectives');

    objectivesController.isReady(function(isObjectivesReady){
        if(!isObjectivesReady){
            console.log(_.now(), 'updateObjectives()')
            anet.getObjectives('en', function(err, data){
                objectivesController.store(data, function(){
                    if(isObjectivesReady){
                        console.log(_.now(), 'updateObjectives() complete')
                    }
                    updateObjectivesCallback();
                });
            })
        }
        else{
            updateObjectivesCallback();
        }
    });
};



const updateMatches = function (updateMatchesCallback) {
    const matchesController = require('./matches');

    matchesController.isReady(function(isMatchesReady){
        if(!isMatchesReady){
            console.log(_.now(), 'updateMatches()')
            anet.getMatches(function(err, data){
                matchesController.store(data, function(){
                    if(isMatchesReady){
                        console.log(_.now(), 'updateMatches() complete')
                    }
                    updateMatchesCallback();
                });
            })
        }
        else{
            updateMatchesCallback();
        }
    });
};



const updateMatchDetails = function (updateMatchDetailsCallback) {
    const matchesController = require('./matches');
    const matchDetailsController = require('./matchDetails');

    matchesController.isReady(function(isMatchesReady){
        if(isMatchesReady){
            const timestamp = _.now();
            
            matchesController.getMatches({}, function(err, matches){
                async.concat(
                    matches,
                    function(match, nextMatch){
                        anet.getMatchDetails(match.id, function(err, matchDetailsData){
                            matchDetailsData.timestamp = timestamp;
                            nextMatch(null, matchDetailsData);
                        })
                    },
                    function(err, results){
                        matchDetailsController.processData(results, updateMatchDetailsCallback);
                    }
                )

            });
        }
        else{
            updateMatchDetailsCallback();
        }
    });
};