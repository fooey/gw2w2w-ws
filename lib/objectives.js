"use strict"

const path = require('path');

const _ = require('lodash');
    
const Objective = require(path.join(process.cwd(), 'classes/objective'));



/*
*
*   DEFINE EXPORT
*
*/

var ObjectivesController = {};
module.exports = ObjectivesController;



/*
*
*   PUBLIC METHODS
*
*/

ObjectivesController.store = function(objectivesData, callback){
    //console.log('insertWorldsByLang(%s)', lang)

    let objectives = [];

    _.forEach(objectivesData, function(objective, ixObjective){
        objectives.push(new Objective({
            id: objective.id,
            name: objective.name
        }));
    })

    GLOBAL.data.objectives = _.sortBy(objectives, function(objective){return objective.id});
    callback();
};



ObjectivesController.each = function(callback){
    return _.forEach(GLOBAL.data.objectives, callback);
}



/*
*   INDIVIDUAL GETTERS
*/

ObjectivesController.getById = _.memoize(function(objectiveId){
    const objective = _.find(GLOBAL.data.objectives, function(objective){ return objective.getId() == objectiveId; });
    if(!objective){throw('objective not found: ' + objectiveId)}
    return objective;
});



/*
*   MASS GETTERS
*/

ObjectivesController.getAll = function(){
     return GLOBAL.data.objectives;
};