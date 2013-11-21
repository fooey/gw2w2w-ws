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
    var setObjectiveNames = function (objectiveNames, lang) {
        GLOBAL.GW2.objectiveNames[lang] = objectiveNames;
        _.each(objectiveNames, function (ixObjective) {
            GLOBAL.GW2.objectiveNamesById[ixObjective.id] = GLOBAL.GW2.objectiveNames[ixObjective.id] || {};
            GLOBAL.GW2.objectiveNamesById[ixObjective.id][lang] = ixObjective.name;
        })
    }

    self.getObjectiveNames = function (lang, objectiveId) {
        if (objectiveId) {
            return GLOBAL.GW2.objectiveNames[ixObjective.id][lang];
        }
        else {
            return GLOBAL.GW2.worldNames.bySlug[lang];
        }
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
        console.log('getMatchesByRegion()', region)
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

        if (GLOBAL.GW2.matchDetailsPREV[matchId]) {
            var diffScores = deepDiff.diff(GLOBAL.GW2.matchDetailsPREV[matchId].scores, GLOBAL.GW2.matchDetails[matchId].scores);
            if (diffScores) {

                //console.log('updated scores', matchId)
                
                wssHandler.broadcastToChannel('overview', {event: 'updateScore', arguments: {matchId: matchId, scores: GLOBAL.GW2.matchDetails[matchId].scores}})
            }
            /*
            if (diff) {
            console.log(matchId, ' objective update')
            _.each(diff, function (thisDiff) {
            console.log('--------------------')
            console.log(thisDiff.item.path)
            if (thisDiff.item.path[0] === 'objectives')
            console.log(thisDiff)
            })
            }
            */
        }
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




    /*
    *   EVENT HANDLERS
    */

    function onWorldNames(data, params) {
        setWorldNames(data, params.lang);
    }



    function onObjectiveNames(data, params) {
        setObjectiveNames(JSON.parse(data), params.lang)
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