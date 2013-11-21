var dataHandler = function () {
    var self = this;

    var request = require('request')
        , url = require('url')
        , deepDiff = require('deep-diff')
        , _  = require('underscore')
        , slugify = require ('slug')
        , path = require('path')




    var updatesInProgress = 0;


    /*
    *
    *   PUBLIC PROPERTIES
    *
    */



    /*
    *
    *   PRIVATE PROPERTIES
    *
    */

    var api = {
        protocol: 'https'
        , hostname: 'api.guildwars2.com'
        , endPoints: {
            worldNames: {
                slug: '/v1/world_names.json'
                , cacheTime: 60 * 60
                , handler: onWorldNames
            }
            , matches: {
                slug: '/v1/wvw/matches.json'
                , cacheTime: 60 * 60
                , handler: onMatches
            }
            , objectiveNames: {
                slug: '/v1/wvw/objective_names.json'
                , cacheTime: 60 * 60
                , handler: onObjectiveNames
            }
            , matchDetails: {
                slug: '/v1/wvw/match_details.json'
                , cacheTime: 3
                , handler: onMatchDetails
            }
        }
    };





    /*
    *
    *   PUBLIC METHODS
    *
    */


    self.updateData = function () {
        //console.log('updating data', new Date());

        GLOBAL.GW2.matchDetailsPREV = JSON.parse(JSON.stringify(GLOBAL.GW2.matchDetails));

        if (!updatesInProgress) {
            console.log('*** Updating Data')
            updateWorldNames();
            updateObjectiveNames();
            updateMatches();


            var waitForCompletion = setInterval(function () {
                if (updatesInProgress === 0) {
                    clearInterval(waitForCompletion);
                    GLOBAL.GW2.ready = true;

                    setTimeout(self.updateData, (randRange(2, 4) * 1000))
                }
            }, 100);
        }

    };





    /*
    *
    *   SETTERS / GETTERS
    *
    */


    // Worlds
    var setWorldNames = function (worldNamesJson, lang) {
        var _worldNames = JSON.parse(worldNamesJson);

        GLOBAL.GW2.worldNames[lang] = GLOBAL.GW2.worldNames[lang] || {}

        _.each(_worldNames, function (ixWorld) {
            var _world = ixWorld
            var slug = slugify(ixWorld.name.toLowerCase()).replace('\'', '');
            _world.slug = slug;
            _world.link = ['/', lang, '/', _world.slug].join('');

            switch(_world.id.charAt(0)){
                case '1': 
                     _world.region = 'US';
                     break;
                case '2': 
                     _world.region = 'EU';
                     break;
            }

            GLOBAL.GW2.worldNamesById[ixWorld.id] = GLOBAL.GW2.worldNamesById[ixWorld.id] || {};
            GLOBAL.GW2.worldNamesById[ixWorld.id][lang] = _world;

            GLOBAL.GW2.worldNames[lang][slug] = _world;
        });

        GLOBAL.GW2.worldNames[lang];
    }
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
        console.log('setObjectives()')
        _.each(_objectiveNames, function (ixObjective) {
            var _objective = enrichObjective({
                name: ixObjective.name
                , id: ixObjective.id
            });
            GLOBAL.GW2.objectives[ixObjective.id] = GLOBAL.GW2.objectives[ixObjective.id] || {};
            GLOBAL.GW2.objectives[ixObjective.id][lang] = _objective;
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

    var enrichObjective = function(objective){
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







    /*
    *
    *   PRIVATE METHODS
    *
    */

    var updateMatches = function () {
        if (isStale('matches')) {
            updateStaticResource('matches', {});
        }
        else {
            updateMatchDetails();
        }
    };


    var updateWorldNames = function () {
        if (isStale('worldNames')) {
            _.each(GLOBAL.GW2.langs, function (lang) {
                updateStaticResource('worldNames', { lang: lang });
            });
        }
    };


    var updateObjectiveNames = function () {
        if (isStale('objectiveNames')) {
            _.each(GLOBAL.GW2.langs, function (lang) {
                updateStaticResource('objectiveNames', { lang: lang });
            });
        }
    };


    var updateStaticResource = function (endpoint, params) {
        var requestUri = url.format({
            protocol: api.protocol
            , hostname: api.hostname
            , pathname: api.endPoints[endpoint].slug
            , query: params
        });

        getRemote(requestUri, params, endpoint);
    };

    var updateMatch = function (matchId) {
        var params = { match_id: matchId };
        var requestUri = url.format({
            protocol: api.protocol
            , hostname: api.hostname
            , pathname: api.endPoints.matchDetails.slug
            , query: params
        });

        getRemote(requestUri, params, 'matchDetails');
    };





    var getRemote = function (requestUri, params, endpoint) {
        //console.log('refresh data: ', requestUri);
        updatesInProgress++;
        request({ url: requestUri, timeout: 10 * 1000 }
            , function (error, response, body) {
                updatesInProgress--;
                if (!error && response.statusCode == 200) {
                    GLOBAL.GW2.timeStamps[endpoint] = new Date();
                    api.endPoints[endpoint].handler(body, params);
                }
                else {
                    console.log(error)
                }
            }
        );
    }


    var isStale = function (endpoint) {
        var dataAge = ((new Date()).getTime() - GLOBAL.GW2.timeStamps[endpoint]) / 1000;
        var isStale = (dataAge > api.endPoints[endpoint].cacheTime);
        return isStale;
    };
    
    var checkForMatchUpdates = function (matchId) {
        if (GLOBAL.GW2.matchDetailsPREV[matchId]) {
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
                    /*
                    console.log('objective: ', changedObjective)
                    console.log('diff: ', diff)
                    console.log('diff kind: ', diffKind)
                    console.log('diff path: ', diffPath)
                    */
                    if(diffPath === 'owner'){
                        updateObjectiveLastCaptured('en', changedObjective.id);
                        updateObjectiveLastCaptured('es', changedObjective.id);
                        updateObjectiveLastCaptured('de', changedObjective.id);
                        updateObjectiveLastCaptured('fr', changedObjective.id);
                        wssHandler.broadcastToChannel('match'+matchId, {event: 'newOwner', arguments: {objective: changedObjective, lastCaptured: Math.floor(Date.now()/1000)}})
                    }
                })
            }
        }
    }




    /*
    *   EVENT HANDLERS
    */

    function onWorldNames(data, params) {
        setWorldNames(data, params.lang);
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




    /*
    *   UTILITY
    */

    var randRange = function (rangeMin, rangeMax) {
        var randInRange = Math.round(
		    (
			    Math.random()
			    * (rangeMax - rangeMin)
		    )
		    + rangeMin
	    );
        return randInRange;
    }


    return self;
};




module.exports = new dataHandler();