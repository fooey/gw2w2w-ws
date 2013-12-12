"use strict"

const path = require('path');

const  _ = require('lodash');
const async = require('async');

const MatchBean = require(path.join(process.cwd(), 'classes/match'));


/*
*
*   DEFINE EXPORT
*
*/

var MatchesController = {};
module.exports = MatchesController;


/*
*
*   PUBLIC METHODS
*
*/

MatchesController.store = function(matchesData, storeCallback){
    //console.log('insertWorldsByLang(%s)', lang)

    let matches = [];

    async.each(
        matchesData,
        function(match, callback){
            matches.push(new MatchBean({
                wvw_match_id: match.wvw_match_id,
                start_time: match.start_time,
                end_time: match.end_time,

                red_world_id: match.red_world_id,
                blue_world_id: match.blue_world_id,
                green_world_id: match.green_world_id
            }));
            callback();
        },
        function(err){
            if(err)throw(err)
            GLOBAL.data.matches = _.sortBy(matches, function(match){return match.getId()});
            storeCallback();
        }
    )

};



MatchesController.each = function(callback){
    return _.forEach(GLOBAL.data.matches, callback);
}



/*
*   INDIVIDUAL GETTERS
*/

MatchesController.getMatchByWorldId = _.memoize(function(lang, worldId){
    return _.find(GLOBAL.data.matches, function(match){
        return (
            match.getRedWorld(lang).getId() == worldId
            || match.getBlueWorld(lang).getId() == worldId
            || match.getGreenWorld(lang).getId() == worldId
        )
    })
}, function(lang, worldId){return lang+worldId});


MatchesController.getById = _.memoize(function(id){
    return _.find(GLOBAL.data.matches, function(match){ return match.getId() === id; })
});




/*
*   MASS GETTERS
*/


MatchesController.getAll = function(){
    return GLOBAL.data.matches;
}


MatchesController.getByRegion = _.memoize(function(region){
    return _.filter(GLOBAL.data.matches, function(match){ return match.getRegion() === region; })
});