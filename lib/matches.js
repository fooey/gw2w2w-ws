var slugify = require ('slug')
    , _ = require('lodash')
    , path = require('path')


var cacheConfig = require(path.join(GLOBAL.appRoot, '/config/cache.js')),
    MatchBean = require(path.join(GLOBAL.appRoot, '/beans/match.js'))



var controller = function (){
    var self = this;


    /*
    *
    *   PUBLIC PROPERITIES
    *
    */




    /*
    *
    *   PUBLIC METHODS
    *
    */

    self.store = function(matchesData, callback){
        //console.log('insertWorldsByLang(%s)', lang)

        var matches = {};

        _.forEach(matchesData, function(match, ixMatch){
            matches[match.wvw_match_id] = new MatchBean({
                wvw_match_id: match.wvw_match_id,
                start_time: match.start_time,
                end_time: match.end_time,

                red_world_id: match.red_world_id,
                blue_world_id: match.blue_world_id,
                green_world_id: match.green_world_id
            });
        })

        GLOBAL.data.matches = matches;
        callback();
    };



    self.getMatchByWorldId = function(worldId){
        return _.find(GLOBAL.data.matches, function(match){
            return (
                match.redWorldId == worldId
                || match.blueWorldId == worldId
                || match.greenWorldId == worldId
            )
        })
    }





    /*
    *
    *   PRIVATE PROPERITIES
    *
    */





    /*
    *
    *   PRIVATE METHODS
    *
    */





    return self;
};



module.exports = new controller();
