var  _ = require('lodash'),
    path = require('path')

var cacheConfig = require(path.join(GLOBAL.appRoot, '/config/cache.js')),
    objectiveTypesController = require(path.join(GLOBAL.appRoot, '/lib/objectiveTypes.js'))
    ObjectiveBean = require(path.join(GLOBAL.appRoot, '/beans/objective.js'));


module.exports = new (function (){
    "use strict";
    var self = this;


    /*
    *
    *   PUBLIC PROPERITIES
    *
    */




    /*
    *
    *   PUBLIC METHODS
    *
    */

    self.store = function(objectivesData, callback){
        //console.log('insertWorldsByLang(%s)', lang)

        var objectives = {};

        _.forEach(objectivesData, function(objective, ixObjective){
            objectives[objective.id] = new ObjectiveBean({
                id: objective.id,
                name: objective.name
            });
        })

        GLOBAL.data.objectives = objectives;
        callback();
    };


    self.getAll = function(){
         return GLOBAL.data.objectives;
    };





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





    return self;
});
