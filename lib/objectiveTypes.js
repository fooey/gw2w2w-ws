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

Controller.objectiveTypes = [
    {id: 1, timer: 1, value: 35, type: 'castle'},
    {id: 2, timer: 1, value: 25, type: 'keep'},
    {id: 3, timer: 1, value: 10, type: 'tower'},
    {id: 4, timer: 1, value:  5, type: 'camp'},
    {id: 5, timer: 0, value:  0, type: 'temple'},
    {id: 6, timer: 0, value:  0, type: 'hollow'},
    {id: 7, timer: 0, value:  0, type: 'estate'},
    {id: 8, timer: 0, value:  0, type: 'overlook'},
    {id: 9, timer: 0, value:  0, type: 'ascent'},
];



/*
*
*   PRIVATE PROPERITIES
*
*/
var objectiveTypeLookup = {
    "castle": Controller.objectiveTypes[0],
    "schloss": Controller.objectiveTypes[0],
    "château": Controller.objectiveTypes[0],
    "castillo": Controller.objectiveTypes[0],

    "keep": Controller.objectiveTypes[1],
    "feste": Controller.objectiveTypes[1],
    "fort": Controller.objectiveTypes[1],
    "fortaleza": Controller.objectiveTypes[1],

    "tower": Controller.objectiveTypes[2],
    "turm": Controller.objectiveTypes[2],
    "tour": Controller.objectiveTypes[2],
    "torre": Controller.objectiveTypes[2],

    // 3 = camp = default

    "((temple of lost prayers))": Controller.objectiveTypes[4],
    "((battle's hollow))": Controller.objectiveTypes[5],
    "((bauer's estate))": Controller.objectiveTypes[6],
    "((orchard overlook))": Controller.objectiveTypes[7],
    "((carver's ascent))": Controller.objectiveTypes[8],
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