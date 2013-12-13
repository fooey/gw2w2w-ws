"use strict"

const path = require('path');

const slugify = require ('slug');
const _ = require('lodash');

const ObjectiveType = require(path.join(process.cwd(), 'classes/objectiveType'))



/*
*
*   DEFINE EXPORT
*
*/

var ObjectiveTypesController = {};
module.exports = ObjectiveTypesController;



/*
*
*   PUBLIC PROPERITIES
*
*/

ObjectiveTypesController.objectiveTypes = [
    new ObjectiveType({id: 1, timer: 1, value: 35, type: 'castle'}),
    new ObjectiveType({id: 2, timer: 1, value: 25, type: 'keep'}),
    new ObjectiveType({id: 3, timer: 1, value: 10, type: 'tower'}),
    new ObjectiveType({id: 4, timer: 1, value:  5, type: 'camp'}),
    new ObjectiveType({id: 5, timer: 0, value:  0, type: 'temple'}),
    new ObjectiveType({id: 6, timer: 0, value:  0, type: 'hollow'}),
    new ObjectiveType({id: 7, timer: 0, value:  0, type: 'estate'}),
    new ObjectiveType({id: 8, timer: 0, value:  0, type: 'overlook'}),
    new ObjectiveType({id: 9, timer: 0, value:  0, type: 'ascent'})
];



/*
*
*   PRIVATE PROPERITIES
*
*/
var objectiveTypeLookup = {
    "castle": ObjectiveTypesController.objectiveTypes[0],
    "schloss": ObjectiveTypesController.objectiveTypes[0],
    "château": ObjectiveTypesController.objectiveTypes[0],
    "castillo": ObjectiveTypesController.objectiveTypes[0],

    "keep": ObjectiveTypesController.objectiveTypes[1],
    "feste": ObjectiveTypesController.objectiveTypes[1],
    "fort": ObjectiveTypesController.objectiveTypes[1],
    "fortaleza": ObjectiveTypesController.objectiveTypes[1],

    "tower": ObjectiveTypesController.objectiveTypes[2],
    "turm": ObjectiveTypesController.objectiveTypes[2],
    "tour": ObjectiveTypesController.objectiveTypes[2],
    "torre": ObjectiveTypesController.objectiveTypes[2],

    // 3 = camp = default

    "((temple of lost prayers))": ObjectiveTypesController.objectiveTypes[4],
    "((battle's hollow))": ObjectiveTypesController.objectiveTypes[5],
    "((bauer's estate))": ObjectiveTypesController.objectiveTypes[6],
    "((orchard overlook))": ObjectiveTypesController.objectiveTypes[7],
    "((carver's ascent))": ObjectiveTypesController.objectiveTypes[8],
};




/*
*
*   PUBLIC METHODS
*
*/



/*
*   INDIVIDUAL GETTERS
*/

ObjectiveTypesController.getObjectiveType = function(objectiveName){
    objectiveName = objectiveName.toLowerCase();
    var objectiveType = objectiveTypeLookup[objectiveName] || ObjectiveTypesController.objectiveTypes[3]; // 3 = camp = default

    return objectiveType;
};