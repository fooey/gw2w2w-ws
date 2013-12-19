"use strict"

const  _ = require('lodash');
const async = require('async');


/*
*
*   DEFINE EXPORT
*
*/

var Controller = {};
module.exports = Controller;


/*
*
*   PUBLIC METHODS
*
*/

Controller.isReady = function(callback){
    const expectedCount = 17;

    dbGetCollection(function(err, db, collection){
        collection.count(function(err, count){
            db.close();
            //console.log(err, count, expectedCount, !!(count >= expectedCount));
            callback(!!(count >= expectedCount));
        });
    });
};

Controller.store = function(matchesData, storeDone){
    async.waterfall([
        function(wfNext){
            // build the array of docs to be sent to the database
            async.concat(
                matchesData,
                function(match, concatMatch){
                    concatMatch(null, {
                        _id: match.wvw_match_id,
                        id: match.wvw_match_id,
                        region: Controller.getRegion(match.wvw_match_id),
                        startTime: match.start_time,
                        endTime: match.end_time,

                        redWorldId: match.red_world_id,
                        blueWorldId: match.blue_world_id,
                        greenWorldId: match.green_world_id,
                    });
                },
                wfNext//(err, matches)
            );

        },

        // truncate, insert, reindex
        function(matches, wfDone){
            dbGetCollection(function(err, db, collection){
                async.series([

                    //truncate old, insert new
                    function(seriesNext){
                        collection.remove({}, function(err, data){
                            collection.insert(matches, seriesNext)
                        })
                    },

                    //set indexes
                    function(seriesNext){collection.ensureIndex({region:1, _id:1}, seriesNext)},

                    //drop db connection
                    function(seriesDone){
                        GLOBAL.data.matches = matches;//FIXME
                        db.close(seriesDone)
                    },
                ],wfDone);
            });   
        },
    ],storeDone);
};


Controller.resetMatches = function(resetDone){
    dbGetCollection(function(err, db, collection){
        collection.remove(function(err, docs){
            console.log('matches collection cleared');
            db.collection('matchDetails').remove(function(err, docs){
                console.log('matchDetails collection cleared');
                db.collection('matchDetailsPREV').remove(function(err, docs){
                    console.log('matchDetailsPREV collection cleared');
                    resetDone();
                })
            })
        })
    });
};


Controller.asyncEach = function(iterator, done){
    Controller.getMatches(function(err, matches){
        async.each(matches, iterator, done);
    });
};


Controller.forEach = function(iterator){
    Controller.getMatches(function(err, matches){
        _.forEach(matches, iterator);
    });
};



/*
*   INDIVIDUAL GETTERS
*/

Controller.getByWorldId = function(worldId, getterCallback){
    const qry = {
        $or: [
            {redWorldId: worldId},
            {blueWorldId: worldId},
            {greenWorldId: worldId},
        ]
    };

    dbGetCollection(function(err, db, collection){
        collection.findOne(qry, function(err, match){
            if(err){console.log('ERROR IN matches.getByWorldId()', err)}
            db.close();

            getterCallback(null, match);
        });
    });
};




Controller.getById = function(id){
    return _.find(GLOBAL.data.matches, function(match){ return match.id === id; })
};




/*
*   MASS GETTERS
*/

Controller.getMatches = function(qry, getterCallback){
    if(!getterCallback){
        getterCallback = arguments[0];
        qry = {};
    }
    qry = qry || {};
    //console.log('WorldsController.getWorlds()', qry, getterCallback);

    dbGetCollection(function(err, db, collection){
        collection.find(qry).sort({_id:1}).toArray(function(err, matches){
            if(err){console.log('ERROR IN matches.getMatches().db.matches.find()', err)}
            db.close();

            getterCallback(null, matches);
        });
    });
};


/*
*
*   UTILITY
*
*/
Controller.getRegion = function(matchId){
    if(matchId.charAt(0) ===  '1') return 'US';
    if(matchId.charAt(0) ===  '2') return 'EU';
};


/*
*
*   PRIVATE METHODS
*
*/

const dbGetCollection = function(callback){
    const db = require('./db');

    require('./db').getCollection('matches', callback);
};