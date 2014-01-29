"use strict"
const path = require('path');
const fs = require('fs');

const _ = require('lodash');
const deepDiff = require('deep-diff');
const async = require('async');


const anet = require('./anet');
const cache = require('./cache');
const stateController = require('./objectiveState');
const guildsController = require('./guilds');




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




/*
*   REMOTE DATA
*/

Controller.updateFromRemote = function(matchDetailsUpdateDone){
    const startTime = Date.now();
    const matchesController = require('./matches');

    const onMatchesReady = function(){
        const timestamp = Date.now();
        
        matchesController.getMatches(function(err, matches){
            let matchIds = _.keys(matches);
            let scores = {};

            async.each(
                matchIds,
                function(matchId, nextMatch){
                    // console.log('matchId', matchId);
                    let match = matches[matchId];

                    anet.getMatchDetails(matchId, function(err, thisMatchDetails){
                        if(err){console.log(err)}

                        if(thisMatchDetails){
                            // console.log('getMatchDetails()', err, thisMatchDetails);

                            thisMatchDetails.timestamp = timestamp;

                            scores[matchId] = thisMatchDetails.scores;

                            _.defer(function(){
                                guildsController.matchUpdateFromRemote(thisMatchDetails, _.noop);
                            });


                            processData(thisMatchDetails, nextMatch);
                        }
                        else{
                            nextMatch(err);
                        }
                    });
                },
                function(err){
                    writeScores(scores, matchDetailsUpdateDone);
                }
            )

        });
    };


    matchesController.isReady(onMatchesReady, matchDetailsUpdateDone);
};





/*
*   DATA IO
*/

// 
const cycleData = function(curDetails, cycleDone){
    const matchId = curDetails.match_id;

    // console.log('cycleData()', matchId, curDetails)

    cache.read({type: 'matchDetails', subType: matchId}, function(err, prevDetails){
        cache.write({type: 'matchDetailsPREV', subType: matchId}, curDetails, function(){
            cache.write({type: 'matchDetails', subType: matchId}, curDetails, function(){
                cycleDone(prevDetails, curDetails);
            });
        });
    });
};


Controller.getMatchDetails = function(matchId, getterCallback){
    cache.read({type: 'matchDetails', subType: matchId}, getterCallback);
};


const writeScores = function(scores, callback){
    cache.write('scores', scores, callback);
};

Controller.getScores = function(getterCallback){
    cache.read('scores', getterCallback);
};




/*
*   MASS GETTERS
*/



/*
*   INDIVIDUAL GETTERS
*/

Controller.getById = function(matchId, getterCallback){
    Controller.getMatchDetails(matchId, function(err, matchesDetails){
        getterCallback(err, matchesDetails);
    });
};




/*
*
*   PRIVATE METHODS
*
*/



/*
*   CHANGE DETECTION
*/

const processData = function(matchesDetails, processDone){
    //FIXME writeScores(matchesDetails, _.noop);

    // console.log('processData()', matchesDetails)

    cycleData(matchesDetails, function(prevDetails, curDetails){
        stateController.initObjectiveState(curDetails, function(){
            if(!prevDetails){
                prevDetails = curDetails;
            }
            findUpdates(prevDetails, curDetails, processDone);
        });
    });
};


const findUpdates = function(prevDetails, curDetails, findUpdatesCallback){
    const matchId = curDetails.match_id;
    async.parallel([
        function(nextUpdateFinder){
            findUpdatedScores(matchId, curDetails.scores, prevDetails.scores, nextUpdateFinder);
        },
        function(nextUpdateFinder){
            findUpdatedObjectives(matchId, curDetails, prevDetails, nextUpdateFinder);
        },
    ],findUpdatesCallback);
};


const findUpdatedScores = function (matchId, curScores, prevScores, callback){
    //console.log('findUpdatedScores()')

    if(prevScores && _.isArray(prevScores) && curScores && _.isArray(curScores)){
        const isDiff = (
            prevScores[0] !== curScores[0]
            || prevScores[1] !== curScores[1]
            || prevScores[2] !== curScores[2]
        );

        if (isDiff) {
            //console.log('scoreChanged!')
            const overviewPacket = {event: 'updateScore', arguments: {matchId: matchId, scores: curScores}};
            GLOBAL.WebSocketServer.broadcastToChannel('overview', overviewPacket);

            const trackerChannel = 'match' + matchId;
            const trackerPacket = {event: 'updateScore', arguments: {scores: curScores}};
            GLOBAL.WebSocketServer.broadcastToChannel(trackerChannel, trackerPacket);
        }
    }


    if(callback)callback(null);
};




const findUpdatedObjectives = function (matchId, curDetail, prevDetail, findUpdatesCallback){
    const currObjectives = _.flatten(_.pluck(curDetail.maps, 'objectives'));
    const prevObjectives = _.flatten(_.pluck(prevDetail.maps, 'objectives'));
    const wsChannel = 'match'+matchId;

    const diffMaps = deepDiff.diff(prevObjectives, currObjectives);

    if(diffMaps && diffMaps.length){

        let wsPackets = [];

        async.each(
            diffMaps,
            function(diff, nextDiff){
                if(diff.item && diff.item.path){
                    processDiff(matchId, diff, currObjectives[diff.index].id, function(wsPacket){
                        wsPackets.push(wsPacket);
                        nextDiff(null);
                    });
                }
                else{
                    nextDiff(null);
                }
            }
            , function(err){
                if(wsPackets.length){
                    // console.log('WS Broadcast for', wsChannel, wsPackets)
                    GLOBAL.WebSocketServer.broadcastToChannel(wsChannel, wsPackets);
                    stateController.updateObjectiveState(matchId, currObjectives, wsPackets, findUpdatesCallback);
                }
                else{
                    findUpdatesCallback(null);
                }
            }
        )
    }
    else{
        findUpdatesCallback(null);
    }
};


const processDiff = function (matchId, diff, objectiveId, callback){
    const diffKind = diff.item.kind;
    const diffPath = diff.item.path[0];

    const timestamp = Math.floor(Date.now() / 1000);
    let wsPacket;
    let toHistory;

    if(diffPath === 'owner'){
        const newOwner = diff.item.rhs;
        wsPacket = {event: 'newOwner', arguments: {objectiveId: objectiveId, owner: newOwner, timestamp: timestamp}};
    }
    else if(diffPath === 'owner_guild'){
        if(diffKind === 'D'){
            wsPacket = {event: 'dropClaimer', arguments: {objectiveId: objectiveId, timestamp: timestamp}};
        }
        else{
            const guildId = diff.item.rhs;
            wsPacket = {event: 'newClaimer', arguments: {objectiveId: objectiveId, guild: guildId, timestamp: timestamp}};
        }
    }
    else{
        wsPacket = {event: 'unhandled', arguments: {objectiveId: objectiveId, diff: diff, timestamp: timestamp}};
    }


    callback(wsPacket);
};




/*
*   UTILITY
*/

const getScoresFromMatchDetails = function(matchesDetails, callback){
    let scores = {};
    async.each(
        Object.keys(matchesDetails),
        function(matchId, next){
            scores[matchId] = matchesDetails[matchId].scores;
            next();
        },
        function(err){
            callback(err, scores);
        }
    );
};

// const buildMatchDetailPairs = function(prevDetails, curDetails, pairCallback){
//     //console.log('buildMatchDetailPairs()')
//     let paired = [];

//     async.each(
//         curDetails,
//         function(thisDetail, next){
//             const matchId = thisDetail.match_id;
//             const prevDetail = _.find(prevDetails, function(p){return p.match_id === thisDetail.match_id});

//             paired.push({
//                 c: thisDetail,
//                 p: prevDetail
//             });
//             next();
//         },
//         function(err, results){
//             pairCallback(null, paired);
//         }
//     );
// };