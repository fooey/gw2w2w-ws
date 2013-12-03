var request = require('request'),
    url = require('url'),
    fs = require('fs'),
    path = require('path')

var _  = require('lodash'),
    async = require('async')

var anet = require(path.join(GLOBAL.appRoot, '/lib/anet.js')),
    worldsController = require(path.join(GLOBAL.appRoot, '/lib/worlds.js')),
    matchesController = require(path.join(GLOBAL.appRoot, '/lib/matches.js')),
    objectivesController = require(path.join(GLOBAL.appRoot, '/lib/objectives.js')),
    matchDetailsController = require(path.join(GLOBAL.appRoot, '/lib/matchDetails.js')),
    myUtil = require(path.join(GLOBAL.appRoot, '/lib/util.js'))




var dataUpdater = function () {
    var self = this;

    /*
    *
    *   PUBLIC METHODS
    *
    */


    self.startUpdater = function (callback) {
        initData(function(){
            callUpdaters(callback)
        });
    };



    /*
    *
    *   PRIVATE PROPERTIES
    *
    */





    /*
    *
    *   PRIVATE METHODS
    *
    */

    var initData = function (initDataCallback){
        console.log('*** Initializing Data')
        async.parallel([
            initGlobals
        ] , function(err, data){
            GLOBAL.data.initialized = myUtil.now();
            initDataCallback();
        });

    };



    var callUpdaters = function(callUpdatersCallback){
        console.log('*** Updating Data')
        async.parallel([
            updateWorlds,
            updateObjectives,
            updateMatches,
        ], function(err, data){
            var refreshTime = _.random(2.5*1000, 5*1000);
            setTimeout(callUpdaters, refreshTime);
            //console.log('*** Updating Data Complete: Next Update in %d', refreshTime)

            if(callUpdatersCallback) callUpdatersCallback();
        });
    }



    var initGlobals = function(callback){
        console.log('*** Initialiaze Globals')
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





    var updateWorlds = function (updateWorldsCallback) {
        if(!Object.keys(GLOBAL.data.worlds).length){
            console.log('updateWorlds()')
            async.concat(
                anet.langs,
                function(lang, callback){
                    anet.getWorlds(lang.key, function(data){
                        callback(null, {lang: lang.key, data: data});
                    })
                },
                function(err, worldsDataConcat){
                    if(err){ console.log(err) }
                    worldsController.store(worldsDataConcat, function(){
                        updateWorldsCallback(null);
                    });
                }
            )
        }
        else{
            updateWorldsCallback(null);
        }
    };



    var updateObjectives = function (updateObjectivesCallback) {
        if(!Object.keys(GLOBAL.data.objectives).length){
            console.log('updateObjectives()')
            anet.getObjectives('en', function(data){
                objectivesController.store(data, function(){
                    updateObjectivesCallback(null);
                });
            })
        }
        else{
            updateObjectivesCallback(null);
        }
    };


    
    var updateMatches = function (updateMatchesCallback) {
        if(!Object.keys(GLOBAL.data.matches).length){
            console.log('updateMatches()')
            anet.getMatches(function(data){
                matchesController.store(data, function(){
                    updateMatchDetails(updateMatchesCallback);
                });
            })
        }
        else{
            updateMatchDetails(updateMatchesCallback);
        }
    };


    
    var updateMatchDetails = function (updateMatchDetailsCallback) {
        //console.log('updateMatchDetails()');
        async.each(
            Object.keys(GLOBAL.data.matches),
            function(matchId, callback){
                var match = GLOBAL.data.matches[matchId];
                anet.getMatchDetails(match.id, function(data){
                    matchDetailsController.store(match.id, data, function(){
                        callback(null);
                    });
                })
            },
            function(err){
                if(err){ console.log(err) }
                matchDetailsController.calcDiff(function(){
                    updateMatchDetailsCallback()
                });
            }
        )
    };





    /*
    *
    *   PRIVATE UTIL
    *
    */


    return self;
};




module.exports = new dataUpdater();