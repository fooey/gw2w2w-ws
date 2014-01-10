"use strict"


/*
*
*   DEFINE EXPORT
*
*/

var Controller = {};
module.exports = Controller;



/*
*
*   PUBLIC PROPERITIES
*
*/

Controller.objectiveTypes = {
    '1': {id: 1, timer: 1, value: 35, type: 'castle'},
    '2': {id: 2, timer: 1, value: 25, type: 'keep'},
    '3': {id: 3, timer: 1, value: 10, type: 'tower'},
    '4': {id: 4, timer: 1, value:  5, type: 'camp'},
    '5': {id: 5, timer: 0, value:  0, type: 'temple'},
    '6': {id: 6, timer: 0, value:  0, type: 'hollow'},
    '7': {id: 7, timer: 0, value:  0, type: 'estate'},
    '8': {id: 8, timer: 0, value:  0, type: 'overlook'},
    '9': {id: 9, timer: 0, value:  0, type: 'ascent'},
};



/*
*
*   PRIVATE PROPERITIES
*
*/
var objectiveTypeLookup = {
    "castle": Controller.objectiveTypes[1],
    "schloss": Controller.objectiveTypes[1],
    "château": Controller.objectiveTypes[1],
    "castillo": Controller.objectiveTypes[1],

    "keep": Controller.objectiveTypes[2],
    "feste": Controller.objectiveTypes[2],
    "fort": Controller.objectiveTypes[2],
    "fortaleza": Controller.objectiveTypes[2],

    "tower": Controller.objectiveTypes[3],
    "turm": Controller.objectiveTypes[3],
    "tour": Controller.objectiveTypes[3],
    "torre": Controller.objectiveTypes[3],

    // 4 = camp = default

    "((temple of lost prayers))": Controller.objectiveTypes[5],
    "((battle's hollow))": Controller.objectiveTypes[6],
    "((bauer's estate))": Controller.objectiveTypes[7],
    "((orchard overlook))": Controller.objectiveTypes[8],
    "((carver's ascent))": Controller.objectiveTypes[9],
};




/*
*
*   PUBLIC METHODS
*
*/



/*
*   INDIVIDUAL GETTERS
*/

Controller.getObjectiveType = function(objectiveName){
    objectiveName = objectiveName.toLowerCase();
    var objectiveType = objectiveTypeLookup[objectiveName] || Controller.objectiveTypes[3]; // 3 = camp = default

    return objectiveType;
};