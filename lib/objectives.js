"use strict"

const _ = require('lodash');
const async = require('async');

const objectiveTypesController = require('../lib/objectiveTypes');

const anet = require('./anet');
const cache = require('./cache');



/*
*
*   DEFINE EXPORT
*
*/

let Controller = {};
module.exports = Controller;



/*
*
*   PUBLIC METHODS
*
*/




/*
*   REMOTE DATA
*/

Controller.updateFromRemote = function(objectivesUpdateDone){
    const startTime = Date.now();

    Controller.isReady(objectivesUpdateDone, function onNotReady(){
        console.log(Date.now(), 'updateObjectives()')
        anet.getObjectives('en', function(err, data){
            Controller.store(data, function(){
                console.log(Date.now(), 'updateObjectives() complete')
                objectivesUpdateDone();
            });
        })
    });
};




/*
*   DATA IO
*/

Controller.store = function(objectivesData, storeDone){
    // build the stuct to be stored
    let objectives = {};

    async.each(
        objectivesData,
        function(objective, nextObjective){
            objective.id = parseInt(objective.id);

            objectives[objective.id] = {
                id: objective.id,
                name: objective.name,
                type: Controller.getObjectiveType(objective.name).id,
                commonNames: {},
            };

            async.each(
                anet.langs,
                function(lang, nextLang){
                    objectives[objective.id].commonNames[lang.key] = Controller.getCommonName(lang.key, objective.id);
                    nextLang();
                },
                nextObjective
            );
        },
        function(err){
            console.log()
            cache.write('objectives', objectives, storeDone);
        }
    );
};


Controller.getObjectives = function(getterCallback){
    cache.read('objectives', getterCallback);
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


/*
*
*   UTILITY METHODS
*
*/

Controller.getObjectiveType = function(objectiveName){
    return objectiveTypesController.getObjectiveType(objectiveName);
};

Controller.getCommonName = function(lang, objectiveId){
    return require('../lib/objectiveCommonNames')[lang][objectiveId];
};

Controller.isReady = function(onReady, onNotReady){
    const expectedCount = 76;
    let bool = false;

    cache.isLocalFresh('objectives', function onFresh(){
        Controller.getObjectives(function(err, objectives){
            const numObjectives = _.keys(objectives).length;
            bool = !!(numObjectives >= expectedCount)

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


