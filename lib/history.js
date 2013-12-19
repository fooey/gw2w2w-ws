"use strict"

const _ = require('lodash');
const async = require('async');

const myUtil = require('./util');

const db = require('./db');
const collectionName = 'history';




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

Controller.newOwner = function(matchId, objectiveId, owner, timestamp){
    const eventType = 'newOwner';
    const qryRemove = {
        matchId: matchId, 
        objectiveId: objectiveId,
        eventType: eventType,
    };
    const newDoc = {
        timestamp: timestamp,
        matchId: matchId,
        objectiveId: objectiveId,
        eventType: eventType,
        owner: owner,
    };

    writeHistory(qryRemove, newDoc);
};


Controller.newClaimer = function(matchId, objectiveId, guildId, timestamp){
    const eventType = 'newClaimer';
    const qryRemove = {
        matchId: matchId, 
        objectiveId: objectiveId,
        eventType: eventType,
    };
    const newDoc = {
        timestamp: timestamp,
        matchId: matchId,
        objectiveId: objectiveId,
        eventType: eventType,
        guildId: guildId,
    };
    
    writeHistory(qryRemove, newDoc);
};


Controller.dropClaimer = function(matchId, objectiveId){
    const eventType = 'newClaimer';
    const qryRemove = {
        matchId: matchId, 
        objectiveId: objectiveId,
        eventType: eventType,
    };
    
    writeHistory(qryRemove, null);
};



/*
*   MASS GETTERS
*/

Controller.get = function(qry, getterCallback){
    if(arguments.length === 1){
        getterCallback = arguments[0];
        qry = {};
    }
    qry = qry || {};
    dbGetCollection(function(err, db, collection){
        if(err){console.log('ERROR IN history.get().dbGetCollection()', err)}

        collection.find(qry).sort({timestamp:-1}).toArray(function(err, docs){
            if(err){console.log('ERROR IN history.get().find()', err)}

            db.close();
            getterCallback(err, docs);
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

    require('./db').getCollection('history', callback);
};


const writeHistory = function(qryRemove, newDoc){
    dbGetCollection(function(err, db, collection){
        async.series([

            //remove current record for this item
            function(seriesNext){
                if(qryRemove){
                    collection.remove(qryRemove, seriesNext)
                }
                else{
                    seriesNext();
                }
            },

            //insert new record
            function(seriesNext){
                if(newDoc){
                    collection.insert(newDoc, seriesNext)
                }
                else{
                    seriesNext()
                }
            },

            //declare indexes
            function(seriesNext){
                async.parallel([
                    function(indexCallback){collection.ensureIndex({timestamp:-1}, indexCallback)},
                    function(indexCallback){collection.ensureIndex({matchId:1, timestamp:-1}, indexCallback)},
                    function(indexCallback){collection.ensureIndex({matchId:1, eventType:1, timestamp:-1}, indexCallback)},
                ], seriesNext);
            },

            //close db connection
            function(seriesDone){
                db.close(seriesDone)
            },
            
        ],_.noop);//function(err, result){}
    });
};