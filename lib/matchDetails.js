"use strict"

const path = require('path');
const fs = require('fs');

const _ = require('lodash');
const deepDiff = require('deep-diff');
const async = require('async');

const cacheConfig = require(path.join(process.cwd(), 'config/cache'));
const myUtil = require(path.join(process.cwd(), 'lib/util'));

const MatchDetails = require(path.join(process.cwd(), 'classes/matchDetails'));



/*
*
*   DEFINE EXPORT
*
*/

var MatchDetailsController = {};
module.exports = MatchDetailsController;



/*
*
*   PRIVATE PROPERITIES
*
*/

const cachePath = path.join(cacheConfig.cacheFolder, 'matchDetails.json');




/*
*
*   PUBLIC METHODS
*
*/

MatchDetailsController.store = function(matchId, matchDetails, storeCallback){
    if(matchDetails){
        GLOBAL.data.matchDetails[matchId] = matchDetails;
        initObjectiveState(matchId, matchDetails);
    }
    storeCallback();
};



MatchDetailsController.findUpdates = function(findUpdates){
    setPrev(function(){
        const matchIds = _.keys(GLOBAL.data.matchDetailsPREV);

        async.each(
            matchIds,
            function(matchId, callback){
                if(GLOBAL.data.matchDetails[matchId] && GLOBAL.data.matchDetailsPREV[matchId]){
                    findUpdatedScores(matchId)
                    findUpdatedObjectives(matchId);
                }
                callback();
            }
            , function(err){if(err)throw(err)}
        );

        findUpdates();
    })
};




/*
*   GETTERS
*/

MatchDetailsController.getMatchDetails = _.memoize(function(matchId){
    return new MatchDetails(GLOBAL.data.matchDetails[matchId]);
});



/*
*
*   PRIVATE METHODS
*
*/

const findUpdatedScores = function (matchId, callback){
    const curScores = GLOBAL.data.matchDetails[matchId].scores;
    const prevScores = GLOBAL.data.matchDetailsPREV[matchId].scores;

    const diffScores = deepDiff.diff(prevScores, curScores);

    if (diffScores) {
        const overviewPacket = {event: 'updateScore', arguments: {matchId: matchId, scores: GLOBAL.data.matchDetails[matchId].scores}};
        GLOBAL.wssHandler.broadcastToChannel('overview', overviewPacket)

        const trackerChannel = 'match' + matchId;
        const trackerPacket = {event: 'updateScore', arguments: {scores: GLOBAL.data.matchDetails[matchId].scores}}
        GLOBAL.wssHandler.broadcastToChannel(trackerChannel, trackerPacket)
    }


    if(callback)callback();
};



const findUpdatedObjectives = function (matchId, callback){
    const currObjectives = _.flatten(_.pluck(GLOBAL.data.matchDetails[matchId].maps, 'objectives'));
    const prevObjectives = _.flatten(_.pluck(GLOBAL.data.matchDetailsPREV[matchId].maps, 'objectives'));

    const now = myUtil.toUtcTimeStamp(Date.now());
    const diffMaps = deepDiff.diff(currObjectives, prevObjectives);

    if(diffMaps && diffMaps.length){
        //console.log('Objectives Changed #',diffMaps.length)
        async.each(
            diffMaps,
            function(diff, callback){
                if(diff.item && diff.item.path){
                    const changedObjective = currObjectives[diff.index];
                    const diffKind = diff.item.kind;
                    const diffPath = diff.item.path[0];

                    if(diffPath === 'owner'){
                        GLOBAL.data.objectiveState[matchId][changedObjective.id].lastCaptured = now;
                        const wsPacket = {event: 'newOwner', arguments: {objective: changedObjective, lastCaptured: now}};
                        //console.log('WS Packet Broadcast for match match%s', matchId, wsPacket)
                        wssHandler.broadcastToChannel('match'+matchId, wsPacket);
                    }
                }
                callback();
            }
            , function(err){if(err)throw(err)}
        )
    }

    if(callback)callback();
};



const initObjectiveState = function (matchId, matchDetails){
    const matchesController = require(path.join(process.cwd(), 'lib/matches'));
    const match = matchesController.getById(matchId);
    //console.log('match', match)

    if(!GLOBAL.data.objectiveState[match.getId()]){
        GLOBAL.data.objectiveState[match.getId()] = {};

        const matchObjectives = _.flatten(matchDetails.maps, 'objectives');

        _.forEach(matchObjectives, function(objective, ixObjective){
            GLOBAL.data.objectiveState[matchId][objective.id] = {
                lastCaptured: match.getStartTime()
            }
        })
    }
}


const setPrev = function (setPrevCallback){
    readFromDisk(function(){
        writeToDisk(function(){
            setPrevCallback()
        })
    });
};



const writeToDisk = function (writeToDiskCallback){
    const writeData = JSON.stringify(GLOBAL.data.matchDetails);

    fs.writeFile(cachePath, writeData, function(err){
        if(err){throw(err)}
        writeToDiskCallback();
    });
};



const readFromDisk = function (readFromDiskCallback){
    fs.exists(cachePath, function (exists) {
        if(exists){
            fs.readFile(cachePath, function(err, data){
                if(err){throw(err)}
                GLOBAL.data.matchDetailsPREV = JSON.parse(data);
                readFromDiskCallback();
            });
        }
        else{
            console.log('NO PREV MATCH DATA EXISTS')
            GLOBAL.data.matchDetailsPrev = {};
            readFromDiskCallback();
        }
    });
};