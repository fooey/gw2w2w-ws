
var path = require('path'),
    fs = require('fs')

var  _ = require('underscore'),
    deepDiff = require('deep-diff'),
    myUtil = require(path.join(GLOBAL.appRoot, '/lib/util.js'))

//var MatchDetailsBean = require(path.join(GLOBAL.appRoot, '/beans/world.js'))


var world = function (){
    var self = this;

    self.cachePath = path.join(GLOBAL.appRoot, 'cache', 'matchDetails.json');


    self.store = function(matchId, matchDetails, callback){
        GLOBAL.data.matchDetails[matchId] = matchDetails;
        initObjectiveState(matchId, matchDetails);
        callback();
    };


    self.calcDiff = function(calcDiffCallBack){
        var now = myUtil.toUtcTimeStamp(Date.now());

        setPrev(function(){
            _.each(GLOBAL.data.matches, function(match, matchId){
                if (GLOBAL.data.matchDetailsPREV[matchId]) {

                    var diffScores = deepDiff.diff(GLOBAL.data.matchDetailsPREV[matchId].scores, GLOBAL.data.matchDetails[matchId].scores);
                    if (diffScores) {
                        var overviewPacket = {event: 'updateScore', arguments: {matchId: matchId, scores: GLOBAL.data.matchDetails[matchId].scores}};
                        //console.log('Broadcast to overview: ', overviewPacket)

                        GLOBAL.wssHandler.broadcastToChannel('overview', overviewPacket)

                        var trackerChannel = 'match' + matchId;
                        var trackerPacket = {event: 'updateScore', arguments: {scores: GLOBAL.data.matchDetails[matchId].scores}}
                        GLOBAL.wssHandler.broadcastToChannel(trackerChannel, trackerPacket)
                    }

                    var currObjectives = _.flatten(_.pluck(GLOBAL.data.matchDetails[matchId].maps, 'objectives'));
                    var prevObjectives = _.flatten(_.pluck(GLOBAL.data.matchDetailsPREV[matchId].maps, 'objectives'));
                    var diffMaps = deepDiff.diff(currObjectives, prevObjectives);
                    if(diffMaps && diffMaps.length){
                        //console.log('Objectives Changed #',diffMaps.length)
                        _.each(diffMaps, function(diff, ixDiff){
                            var changedObjective = currObjectives[diff.index];
                            var diffKind = diff.item.kind;
                            var diffPath = diff.item.path[0];

                            if(diffPath === 'owner'){
                                GLOBAL.data.objectiveState[matchId][changedObjective.id].lastCaptured = now;
                                var wsPacket = {event: 'newOwner', arguments: {objective: changedObjective, lastCaptured: now}};
                                //console.log('WS Packet Broadcast for match match%s', matchId, wsPacket)
                                wssHandler.broadcastToChannel('match'+matchId, wsPacket);
                            }
                        })
                    }
                }
            });

            calcDiffCallBack();
        })
    };



    function initObjectiveState(matchId, matchDetails){
        //GLOBAL.data.objectiveState[matchid][changedObjective.id]
        var match = GLOBAL.data.matches[matchId];

        if(!GLOBAL.data.objectiveState[matchId]){
            GLOBAL.data.objectiveState[matchId] = {};

            var matchObjectives = _.flatten(_.pluck(matchDetails.maps, 'objectives'));

            _.each(matchObjectives, function(objective, ixObjective){
                GLOBAL.data.objectiveState[matchId][objective.id] = {
                    lastCaptured: match.startTime
                }
            })
        }
    }


    function setPrev(setPrevCallback){
        readFromDisk(function(){
            writeToDisk(function(){
                setPrevCallback()
            })
        });
    };


    function writeToDisk(writeToDiskCallback){
        fs.writeFile(self.cachePath, JSON.stringify( GLOBAL.data.matchDetails), function(err){
            if(err){
                console.log(err)
            }
            writeToDiskCallback();
        });
    };


    function readFromDisk(readFromDiskCallback){
        fs.exists(self.cachePath, function (exists) {
            if(exists){
                fs.readFile(self.cachePath, function(err, data){
                    if(err){
                        console.log(err)
                    }
                    GLOBAL.data.matchDetailsPREV = JSON.parse(data);
                    readFromDiskCallback();
                });
            }
            else{
                GLOBAL.data.matchDetailsPrev = {};
                readFromDiskCallback();
            }
        });
    };



    return self;
};



module.exports = new world();
