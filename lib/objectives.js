"use strict"

const _ = require('lodash');
const async = require('async');

const objectiveTypesController = require('../lib/objectiveTypes');
const objectiveCommonNames = require('../lib/objectiveCommonNames');



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
    const expectedCount = 76;

    dbGetCollection(function(err, db, collection){
        collection.count(function(err, count){
            db.close();
            //console.log(err, count, expectedCount, !!(count >= expectedCount));
            callback(!!(count >= expectedCount));
        });
    });
};


Controller.store = function(objectivesData, storeDone){
    async.waterfall([
        function(wfNext){
            // build the array of docs to be sent to the database
            async.concat(
                objectivesData,
                function(objective, concatObjective){
                    objective.id = parseInt(objective.id);

                    concatObjective(null, {
                        _id: objective.id,
                        id: objective.id,
                        name: objective.name,
                    });
                },
                wfNext//(err, worlds)
            );

        },

        // truncate, insert, reindex
        function(docs, wfDone){
            dbGetCollection(function(err, db, collection){
                async.series([

                    //truncate old, insert new
                    function(seriesNext){
                        collection.remove({}, function(err, data){
                            collection.insert(docs, seriesNext)
                        })
                    },

                    //set indexes
                    /*function(seriesNext){
                        async.parallel([
                            function(indexCallback){collection.ensureIndex({lang:1, slug:1}, indexCallback)},
                            function(indexCallback){collection.ensureIndex({lang:1, name:1}, indexCallback)},
                            function(indexCallback){collection.ensureIndex({lang:1, region:1, name:1}, indexCallback)},
                        ], seriesNext);
                    },*/

                    

                    //drop db connection
                    function(seriesDone){
                        db.close(seriesDone)
                    },
                ],wfDone);
            });
        },
    ],storeDone);
};



/*
*   INDIVIDUAL GETTERS
*/

Controller.getById = _.memoize(function(objectiveId){
    const objective = _.find(GLOBAL.data.objectives, function(objective){ return objective.getId() == objectiveId; });
    if(!objective){throw('objective not found: ' + objectiveId)}
    return objective;
});




/*
*   MASS GETTERS
*/

Controller.getObjectives = function(qry, getterCallback){
    if(arguments.length === 1){
        getterCallback = arguments[0];
        qry = {};
    }
    qry = qry || {};

    dbGetCollection(function(err, db, collection){
        collection.find(qry).sort({id:1}).toArray(function(err, objectives){
            if(err){console.log('ERROR IN getObjectives', err)}
            db.close();

            getterCallback(err, objectives);
        });
    });
};


/*
*
*   UTILITY METHODS
*
*/

Controller.getObjectiveType = function(objectiveName){
    return objectiveTypesController.getObjectiveType(objectiveName);
};

Controller.getCommonName = function(lang, objectiveId){
    return objectiveCommonNames[lang][objectiveId];
};


/*
*
*   PRIVATE METHODS
*
*/

const dbGetCollection = function(callback){
    const db = require('./db');

    require('./db').getCollection('objectives', callback);
};


