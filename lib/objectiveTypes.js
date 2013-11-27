var slugify = require ('slug'),
    _ = require('underscore'),
    path = require('path')

var ObjectiveTypeBean = require(path.join(GLOBAL.appRoot, '/beans/objectiveType.js'))


module.exports = new (function (){
    var self = this;


    /*
    *
    *   PUBLIC PROPERITIES
    *
    */

    self.objectiveTypes = [
        new ObjectiveTypeBean({id: 1, type: 'castle', value: 35}),
        new ObjectiveTypeBean({id: 2, type: 'keep', value: 25}),
        new ObjectiveTypeBean({id: 3, type: 'tower', value: 10}),
        new ObjectiveTypeBean({id: 4, type: 'camp', value: 5}),
        new ObjectiveTypeBean({id: 5, type: 'temple', value: 0}),
        new ObjectiveTypeBean({id: 6, type: 'hollow', value: 0}),
        new ObjectiveTypeBean({id: 7, type: 'estate', value: 0}),
        new ObjectiveTypeBean({id: 8, type: 'overlook', value: 0}),
        new ObjectiveTypeBean({id: 9, type: 'ascent', value: 0})
    ];




    /*
    *
    *   PUBLIC METHODS
    *
    */


    self.getObjectiveType = function(objectiveName){
        objectiveName = objectiveName.toLowerCase();
        var objectiveType = objectiveTypeLookup[objectiveName] || self.objectiveTypes[3]; // 3 = camp = default

        return objectiveType;
    };





    /*
    *
    *   PRIVATE PROPERITIES
    *
    */
    var objectiveTypeLookup = {
        "castle": self.objectiveTypes[0],
        "schloss": self.objectiveTypes[0],
        "château": self.objectiveTypes[0],
        "castillo": self.objectiveTypes[0],

        "keep": self.objectiveTypes[1],
        "feste": self.objectiveTypes[1],
        "fort": self.objectiveTypes[1],
        "fortaleza": self.objectiveTypes[1],

        "tower": self.objectiveTypes[2],
        "turm": self.objectiveTypes[2],
        "tour": self.objectiveTypes[2],
        "torre": self.objectiveTypes[2],

        // 3 = camp = default

        "((temple of lost prayers))": self.objectiveTypes[4],
        "((battle's hollow))": self.objectiveTypes[5],
        "((bauer's estate))": self.objectiveTypes[6],
        "((orchard overlook))": self.objectiveTypes[7],
        "((carver's ascent))": self.objectiveTypes[8],
    };





    /*
    *
    *   PRIVATE METHODS
    *
    */





    return self;
});