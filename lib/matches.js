"use strict"

const  _ = require('lodash');
const async = require('async');

const anet = require('./anet');
const cache = require('./cache');


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


Controller.resetMatches = function(resetDone){
    throw('not implemented');
    // dbGetCollection(function(err, db, collection){
    //     collection.remove(function(err, docs){
    //         console.log('matches collection cleared');
    //         db.collection('matchDetails').remove(function(err, docs){
    //             console.log('matchDetails collection cleared');
    //             db.collection('matchDetailsPREV').remove(function(err, docs){
    //                 console.log('matchDetailsPREV collection cleared');
    //                 resetDone();
    //             })
    //         })
    //     })
    // });
};




/*
*   REMOTE DATA
*/

Controller.updateFromRemote = function(remoteUpdateDone){
    const startTime = Date.now();

    Controller.isReady(remoteUpdateDone, function onNotReady(){
        console.log(Date.now(), 'updateMatches()')
        anet.getMatches(function(err, data){
            Controller.store(data, function(){
                console.log(Date.now(), 'updateMatches() complete', Date.now() - startTime, 'elapsed');
                remoteUpdateDone();
            });
        });
    });
};




/*
*   DATA IO
*/

Controller.store = function(matchesData, storeDone){
    let matches = {};
    // build the struct to be stored
    async.each(
        matchesData,
        function(match, next){
            matches[match.wvw_match_id] = {
                id: match.wvw_match_id,
                region: __getRegion(match.wvw_match_id),
                startTime: Math.floor(new Date(match.start_time).getTime() / 1000),
                endTime: Math.floor(new Date(match.end_time).getTime() / 1000),

                redWorldId: match.red_world_id,
                blueWorldId: match.blue_world_id,
                greenWorldId: match.green_world_id,
            };

            next()
        },
        function(err){
            cache.write('matches', matches, storeDone);
        }
    );
};

Controller.getMatches = function(getterCallback){
    cache.read('matches', getterCallback);
};



/*
*   INDIVIDUAL GETTERS
*/

Controller.getByWorldId = function(worldId, getterCallback){
    Controller.getMatches(function(err, matches){
        const result = _.find(matches, function(match){
            return (
                match.redWorldId == worldId
                || match.blueWorldId == worldId
                || match.greenWorldId == worldId
            )
        });
        getterCallback(null, result);
    });
};




Controller.getById = function(id, callback){
    Controller.getMatches(function(err, matches){
        callback(matches[id])
    });
};




/*
*   MASS GETTERS
*/




/*
*
*   UTILITY
*
*/

Controller.isReady = function(onReady, onNotReady){
    const expectedCount = 17;
    let bool = false;

    cache.isLocalFresh('matches', function onFresh(){
        Controller.getMatches(function(err, matches){
            const numMatches = _.keys(matches).length;
            bool = !!(numMatches >= expectedCount)

            if(bool){
                onReady()
            }
            else{
                onNotReady()
            }
        });
    }, onNotReady);
};


/*
*
*   PRIVATE METHODS
*
*/
const __getRegion = function(matchId){
    if(matchId.charAt(0) ===  '1') return 'US';
    if(matchId.charAt(0) ===  '2') return 'EU';
};