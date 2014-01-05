"use strict"

const _ = require('lodash');
const async = require('async');

const myUtil = require('./util');

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



Controller.initObjectiveState = function(matchDetails, initObjectiveStateCallback){
    const currObjectives = _.flatten(_.pluck(matchDetails.maps, 'objectives'));
    const matchId = matchDetails.match_id;
    const timestamp = Math.floor(Date.now() / 1000);
    //console.log('initObjectiveState()', matchId)

    cache.read({type: 'objectiveState', subType: matchId}, function(err, objectiveState){
        if(!objectiveState){objectiveState = {};}
        if(!objectiveState[matchId]){objectiveState[matchId] = {};}

        async.each(
            currObjectives,
            function(objective, nextObjective){
                if(!objectiveState[matchId][objective.id]){
                    objectiveState[matchId][objective.id] = {
                        owner:{
                            color: objective.owner, 
                            timetamp: timestamp
                        },
                        guild: {}
                    };
                    if(objective.owner_guild){
                        objectiveState[matchId][objective.id].guild = {
                            id: objective.owner_guild, 
                            timestamp: timestamp
                        }
                    }
                }
                nextObjective(null);
            },
            function(err){
                cache.write({type: 'objectiveState', subType: matchId}, objectiveState, initObjectiveStateCallback);
            }
        );
    });
};


Controller.updateObjectiveState = function(matchId, currObjectives, wsPackets, updateObjectiveStateCallback){
    //console.log('updateObjectiveState()');
    async.waterfall([

        //read from cache
        function(nextWF){
            cache.read({type: 'objectiveState', subType: matchId}, nextWF);
        },

        //udpate data
        function(objectiveState, nextWF){

            async.each(
                wsPackets,
                function(packet, nextPacket){
                    //console.log(packet);
                    const objectiveId = packet.arguments.objectiveId;

                    if(packet.event === 'newOwner'){
                        objectiveState[matchId][objectiveId].owner = {
                            color: packet.arguments.owner,
                            timestamp: packet.arguments.timestamp,
                        };
                    }
                    else{

                        if(packet.event === 'newClaimer'){
                            objectiveState[matchId][objectiveId].guild = {
                                id: packet.arguments.guild,
                                timestamp: packet.arguments.timestamp,
                            };
                        }
                        else if(packet.event === 'dropClaimer'){
                            objectiveState[matchId][objectiveId].guild = {};
                        }
                    }
                    nextPacket(null);

                },
                function(err){
                    nextWF(null, objectiveState)
                }
            );
        },

        //write to cache
        function(objectiveState, nextWF){
            if(objectiveState){
                //console.log(objectiveState)
                cache.write({type: 'objectiveState', subType: matchId}, objectiveState, nextWF);
            }
            else{
                nextWF();
            }
        },
    ], updateObjectiveStateCallback);
};



/*
*   INDIVIDUAL GETTERS
*/


Controller.getById = function(matchId, getterCallback){
    cache.read({type: 'objectiveState', subType: matchId}, function(err, data){
        getterCallback(err, data[matchId]);
    });
};



/*
*   MASS GETTERS
*/




/*
*
*   PRIVATE METHODS
*
*/