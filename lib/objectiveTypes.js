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
    new ObjectiveType({id: 1, type: 'castle', value: 35}),
    new ObjectiveType({id: 2, type: 'keep', value: 25}),
    new ObjectiveType({id: 3, type: 'tower', value: 10}),
    new ObjectiveType({id: 4, type: 'camp', value: 5}),
    new ObjectiveType({id: 5, type: 'temple', value: 0}),
    new ObjectiveType({id: 6, type: 'hollow', value: 0}),
    new ObjectiveType({id: 7, type: 'estate', value: 0}),
    new ObjectiveType({id: 8, type: 'overlook', value: 0}),
    new ObjectiveType({id: 9, type: 'ascent', value: 0})
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