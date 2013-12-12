"use strict"

const path = require('path')

const _ = require('lodash');

const objectiveTypesController = require(path.join(process.cwd(), 'lib/objectiveTypes'));
const objectiveCommonNames = require(path.join(process.cwd(), 'lib/objectiveCommonNames'));


function Objective (parameters) {
    let obj = this;


    /*
    *
    *  PROPERTIES
    *
    */
    const __INSTANCE = {
        id: parameters.id,
        name: parameters.name,
        
        //objectiveType, commonName
    };




    /*
    *
    *  GETTERS
    *
    */

    obj.getId = function(){return __INSTANCE.id;}
    obj.getName = function(){return __INSTANCE.name;}

    obj.getObjectiveType = _.memoize(function(){
        return objectiveTypesController.getObjectiveType(obj.getName());
    });

    obj.getCommonName = _.memoize(function(lang){
        return objectiveCommonNames[lang][obj.getId()];
    });

};

module.exports = Objective;




