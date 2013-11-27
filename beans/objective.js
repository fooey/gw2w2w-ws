var path = require('path');

var objectiveTypesController = require(path.join(GLOBAL.appRoot, '/lib/objectiveTypes.js'))
    , objectiveCommonNames = require(path.join(GLOBAL.appRoot, '/lib/objectiveCommonNames.js'));


var bean = function (parameters) {
    "use strict";
    var self = this;

    /*
    *
    *  PUBLIC PROPERTIES
    *
    */

    self.id = parameters.id;
    self.name = parameters.name;
    self.objectiveType = getObjectiveType(self.name);



    /*
    *
    *  PUBLIC METHODS
    *
    */
    self.getCommonName = function(lang){
        return objectiveCommonNames[lang][self.id];
    }





    /*
    *
    *   PRIVATE PROPERITIES
    *
    */






    /*
    *
    *   PRIVATE METHODS
    *
    */


    function getObjectiveType(name){
        return objectiveTypesController.getObjectiveType(name);
    };







    return self;
};

module.exports = bean;




