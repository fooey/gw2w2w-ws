"use strict"
const path = require('path');
const fs = require('fs');

const _ = require('lodash');
const deepDiff = require('deep-diff');
const async = require('async');

const myUtil = require('./util');
const historyController = require('./history');

const db = require('./db');
const collectionName = 'matchDetails';




/*
*
*   DEFINE EXPORT
*
*/

var Controller = {};
module.exports = Controller;



/*
*
*   PRIVATE PROPERITIES
*
*/




/*
*
*   PUBLIC METHODS
*
*/

Controller.processData = function(allMatchesDetails, processDone){
    Controller.cycleData(allMatchesDetails, function(prevDetails, curDetails){
        if(prevDetails){
            findUpdates(prevDetails, curDetails, processDone);
        }
        else{
            processDone();
        }
    });
};



Controller.cycleData = function(allMatchesDetails, cycleDone){
    dbGetCollection(function(err, db, collection){
        async.series([

            //copy to prev, returns prevDetails as results[0]
            function(seriesNext){
                collection.find({}).toArray(function(err, toPrev){
                    if(toPrev.length){
                        db.collection('matchDetailsPREV').remove({}, function(){
                            db.collection('matchDetailsPREV').insert(toPrev, seriesNext); // returns insert as result[0]
                        });
                    }
                    else{
                        seriesNext(null);
                    }
                })
            },

            //truncate and insert new data, returns prevDetails as results[1]
            function(seriesNext){collection.remove(function(err, data){
                collection.insert(allMatchesDetails, seriesNext)
            })},

            //declare indexes
            function(seriesNext){
                async.parallel([
                    function(indexCallback){collection.ensureIndex({match_id:1, timestamp:-1}, indexCallback);},
                    function(indexCallback){collection.ensureIndex({timestamp:-1}, indexCallback);},
                ], seriesNext);
            },

            //close db connection
            function(seriesDone){
                db.close(seriesDone)
            },

        ],function(err, results){
            let prevDetails = results[0];
            let curDetails = results[1];

            cycleDone(prevDetails, curDetails);
        });
    });

}



/*
*   MASS GETTERS
*/

Controller.getScores = function(getterCallback){
    const qry = {};
    const cols = {match_id:1, scores:1}
    const sort = {match_id:1}

    
    dbGetCollection(function(err, db, collection){
        collection.find(qry, cols).sort(sort).toArray(function(err, scores){
            if(err){console.log('ERROR IN getScores().find()', err)}
            db.close();

            getterCallback(err, scores);
        });
    });
};



/*
*   INDIVIDUAL GETTERS
*/

Controller.getById = function(matchId, getterCallback){
    const qry = {match_id: matchId};

    
    dbGetCollection(function(err, db, collection){
        collection.findOne(qry, function(err, matchDetails){
            if(err){console.log('ERROR IN getMatchDetails().find()', err)}
            db.close();

            getterCallback(err, matchDetails);
        });
    });
};




/*
*
*   PRIVATE METHODS
*
*/

const dbGetCollection = function(callback){
    const db = require('./db');

    require('./db').getCollection('matchDetails', callback);
};


const findUpdates = function(prevDetails, curDetails, findUpdatesCallback){
    buildMatchDetailPairs(prevDetails, curDetails, function(err, paired){
        async.each(
            paired,
            function(pair, nextPair){
                async.parallel([
                    function(nextCompare){
                        findUpdatedScores(pair.c.match_id, pair.c.scores, pair.p.scores, nextCompare);
                    },
                    function(nextCompare){
                        findUpdatedObjectives(pair.c, pair.p, nextCompare);
                    }],
                function(err, results){
                    nextPair(null);
                });
            },
            function(err, results){
                findUpdatesCallback(null);
            }
        );
    });
};


const buildMatchDetailPairs = function(prevDetails, curDetails, pairCallback){
    let paired = [];

    async.each(
        curDetails,
        function(thisDetail, next){
            const matchId = thisDetail.match_id;
            const prevDetail = _.find(prevDetails, function(p){return p.match_id === thisDetail.match_id});

            paired.push({
                c: thisDetail,
                p: prevDetail
            });
            next();
        },
        function(err, results){
            pairCallback(null, paired);
        }
    );

}


const findUpdatedScores = function (matchId, curScores, prevScores, callback){
    const isDiff = (
        prevScores[0] !== curScores[0]
        || prevScores[1] !== curScores[1]
        || prevScores[2] !== curScores[2]
    );

    if (isDiff) {
        const overviewPacket = {event: 'updateScore', arguments: {matchId: matchId, scores: curScores}};
        GLOBAL.WebSocketServer.broadcastToChannel('overview', overviewPacket);

        const trackerChannel = 'match' + matchId;
        const trackerPacket = {event: 'updateScore', arguments: {scores: curScores}};
        GLOBAL.WebSocketServer.broadcastToChannel(trackerChannel, trackerPacket);
    }


    if(callback)callback(null);
};




const findUpdatedObjectives = function (curDetail, prevDetail, findUpdatesCallback){
    const currObjectives = _.flatten(_.pluck(curDetail.maps, 'objectives'));
    const prevObjectives = _.flatten(_.pluck(prevDetail.maps, 'objectives'));

    const matchId = curDetail.match_id
    const wsChannel = 'match'+matchId;

    const diffMaps = deepDiff.diff(prevObjectives, currObjectives);


    if(diffMaps && diffMaps.length){
        //console.log('Objectives Changed #',diffMaps.length)
        async.concat(
            diffMaps,
            function(diff, callback){
                let wsPacket = null;

                if(diff.item && diff.item.path){
                    wsPacket = processDiff(matchId, diff, currObjectives[diff.index]);
                }

                callback(null, wsPacket);

            }
            , function(err, wsPackets){
                if(wsPackets.length){
                    //console.log('WS Broadcast for', wsChannel, wsPackets)
                    GLOBAL.WebSocketServer.broadcastToChannel(wsChannel, wsPackets);
                }
                findUpdatesCallback(null);
            }
        )
    }
    else{
        findUpdatesCallback(null);
    }

};



const processDiff = function (matchId, diff, objective){
    const objectiveId = objective.id;
    const diffKind = diff.item.kind;
    const diffPath = diff.item.path[0];

    const now = myUtil.now();


    if(diffPath === 'owner'){
        const newOwner = diff.item.rhs;

        _.defer(function(){
            historyController.newOwner(matchId, objectiveId, newOwner.toLowerCase(), now)
        });

        return {event: 'newOwner', arguments: {objective: objectiveId, team: newOwner, lastCaptured: now}};
    }
    else if(diffPath === 'owner_guild'){
        if(diffKind === 'D'){

            _.defer(function(){
                historyController.dropClaimer(matchId, objectiveId)
            });

            return {event: 'dropClaimer', arguments: {objective: objectiveId}};
        }
        else{
            const guildId = diff.item.rhs;

            _.defer(function(){
                historyController.newClaimer(matchId, objectiveId, guildId, now)
            });

            return {event: 'newClaimer', arguments: {objective: objectiveId, guild: guildId}};
        }
    }
    else{
        return {event: 'unhandled', arguments: {objective: objectiveId, diff: diff}};
    }
}