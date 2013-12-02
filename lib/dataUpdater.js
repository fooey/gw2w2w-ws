var request = require('request'),
    url = require('url'),
    fs = require('fs'),
    path = require('path')

var _  = require('underscore'),
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
            var refreshTime = myUtil.randRange(2.5*1000, 5*1000);
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


















    /*
    *
    *   SETTERS / GETTERS
    *
    */


    /*
    self.getWorlds = function (lang) {
        return GLOBAL.GW2.worldNames[lang];
    }
    self.getWorldsByRegion = function (region, lang) {
        //console.log('getWorldsByRegion()', region, lang)
        return _.filter(GLOBAL.GW2.worldNames[lang], function(world){
            return (world.region === region);
        });
    }
    self.getWorldBySlug = function (lang, slug) {
        //console.log('getWorldBySlug', lang, slug);
        return GLOBAL.GW2.worldNames[lang][slug];
    }
    self.getWorldById = function (lang, worldId) {
        return GLOBAL.GW2.worldNamesById[worldId][lang];
    }
    self.getWorldLink = function (lang, world) {
        return ['/', lang, '/', world.slug].join('');
    }


    // Objective Names
    var setObjectives = function (data, lang) {
        var _objectiveNames = JSON.parse(data);
        //console.log('setObjectives()')
        _.each(_objectiveNames, function (ixObjective) {
            GLOBAL.GW2.objectives[ixObjective.id] = GLOBAL.GW2.objectives[ixObjective.id] || {};
            GLOBAL.GW2.objectives[ixObjective.id][lang] = ixObjective.name;

            if(!GLOBAL.GW2.objectivesMeta[ixObjective.id]){
                GLOBAL.GW2.objectivesMeta[ixObjective.id] = setObjectiveMeta({
                    name: ixObjective.name
                    , id: ixObjective.id
                })
            }

        });
    }

    self.getObjectives = function (lang) {
        return GLOBAL.GW2.objectives;
    }

    self.getObjective = function (lang, objectiveId) {
        return GLOBAL.GW2.objectives[objectiveId][lang];
    }

    var updateObjectiveLastCaptured = function (lang, objectiveId) {
        GLOBAL.GW2.objectives[objectiveId][lang].lastCaptured = Math.floor(Date.now()/1000);
    }

    var setObjectiveMeta = function(objective){
        if(objective.id >= 62 && objective.id <= 76){
            if(objective.id == 62 || objective.id == 71 || objective.id == 76){
                objective.type = 'temple';
                objective.points = 0;
            }
            else if(objective.id == 63 || objective.id == 70 || objective.id == 75){
                objective.type = 'hollow';
                objective.points = 0;
            }
            else if(objective.id == 64 || objective.id == 69 || objective.id == 74){
                objective.type = 'estate';
                objective.points = 0;
            }
            else if(objective.id == 65 || objective.id == 68 || objective.id == 73){
                objective.type = 'overlook';
                objective.points = 0;
            }
            else if(objective.id == 66 || objective.id == 67 || objective.id == 72){
                objective.type = 'ascent';
                objective.points = 0;
            }
        }
        else{
            switch(objective.name.toLowerCase()){
                
                case 'castle':
                case 'schloss':     //de
                case 'château':     //fr
                case 'castillo':    //es
                    objective.type = 'castle';
                    objective.points = 35;
                    break;
                    
                case 'keep':
                case 'feste':       //de
                case 'fort':        //fr
                case 'fortaleza':   //es
                    objective.type = 'keep';
                    objective.points = 25;
                    break;
                
                case 'tower':
                case 'turm':        //de
                case 'tour':        //fr
                case 'torre':       //es
                    objective.type = 'tower'
                    objective.points = 10;
                    break;
                    
                case 'camp':
                default:
                    objective.type = 'camp';
                    objective.points = 5;
            }
        }
        objective.lastCaptured = Math.floor(Date.now() / 1000);
        return objective;
    }


    // Matches
    var setMatches = function (matchesJson) {
        var _matchesArray = JSON.parse(matchesJson).wvw_matches;
        var _matchesCollection = {};
        _.each(_matchesArray, function(match){
            switch(match.wvw_match_id.charAt(0)){
                case '1': 
                     match.region = 'US';
                     break;
                case '2': 
                     match.region = 'EU';
                     break;
            }
            _matchesCollection[match.wvw_match_id] = match;

        });

        GLOBAL.GW2.matches = _matchesCollection;
    }

    self.getMatches = function () {
        return GLOBAL.GW2.matches;
    }
    self.getMatchesByRegion = function (region) {
        //console.log('getMatchesByRegion()', region)
        return _.filter(GLOBAL.GW2.matches, function(match){
            return (match.region === region);
        });
    }
    self.getMatchByWorldId = function(worldId){
        //console.log('getMatchByServerId()', worldId)
        return _.find(GLOBAL.GW2.matches, function(match){
            return (match.red_world_id == worldId || match.blue_world_id == worldId || match.green_world_id == worldId);
        });
    }


    // Match Details
    var setMatchDetails = function (data, matchId) {
        GLOBAL.GW2.matchDetails[matchId] = JSON.parse(data);
        checkForMatchUpdates(matchId);
    }

    self.getMatchDetails = function (matchId) {
        return GLOBAL.GW2.matchDetails[matchId];
    }










    var updateObjectives = function (callback) {
        if (isStale('objectiveNames')) {
            _.each(GLOBAL.GW2.langs, function (lang) {
                updateStaticResource('objectiveNames', { lang: lang });
            });
        }
        callback(null, true);
    };


    
    var checkForMatchUpdates = function (matchId) {
        if (GLOBAL.GW2.matchDetailsPREV[matchId]) {
            var now = Math.floor(Date.now()/1000);
            var diffScores = deepDiff.diff(GLOBAL.GW2.matchDetailsPREV[matchId].scores, GLOBAL.GW2.matchDetails[matchId].scores);
            if (diffScores) {
                wssHandler.broadcastToChannel('overview', {event: 'updateScore', arguments: {matchId: matchId, scores: GLOBAL.GW2.matchDetails[matchId].scores}})
                wssHandler.broadcastToChannel('match'+matchId, {event: 'updateScore', arguments: {scores: GLOBAL.GW2.matchDetails[matchId].scores}})
            }

            var currObjectives = _.flatten(_.pluck(GLOBAL.GW2.matchDetails[matchId].maps, 'objectives'));
            var prevObjectives = _.flatten(_.pluck(GLOBAL.GW2.matchDetailsPREV[matchId].maps, 'objectives'));
            var diffMaps = deepDiff.diff(currObjectives, prevObjectives);
            if(diffMaps && diffMaps.length){
                //console.log('Objectives Changed #',diffMaps.length)
                _.each(diffMaps, function(diff, ixDiff){
                    var changedObjective = currObjectives[diff.index];
                    var diffKind = diff.item.kind;
                    var diffPath = diff.item.path[0];

                    if(diffPath === 'owner'){
                        GLOBAL.GW2.objectivesMeta[changedObjective.id].lastCaptured = now;
                        wssHandler.broadcastToChannel('match'+matchId, {event: 'newOwner', arguments: {objective: changedObjective, lastCaptured: now}})
                    }
                })
            }
        }
    }



    function onWorldNames(worldsJson, params, callback) {
        worldController.insertWorlds(params.lang, worldsJson, function(){
            console.log('done inserting worlds(%s)', params.lang);
        });
    }



    function onObjectiveNames(data, params) {
        setObjectives(data, params.lang)
    }

    function onMatches(data) {
        setMatches(data);
        updateMatchDetails();
    }

    function updateMatchDetails() {
        if (isStale('matchDetails')) {
            _.each(GLOBAL.GW2.matches, function (match) {
                updateMatch(match.wvw_match_id);
            });
        }
    }

    function onMatchDetails(data, params) {
        var matchId = params.match_id;
        //console.log('storing match details', params.match_id);
        setMatchDetails(data,  matchId);
    }
    */


























