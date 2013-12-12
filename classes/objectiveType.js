"use strict"

const path = require('path');
const _ = require('lodash');

function ObjectiveType (parameters) {
    let obj = this;


    /*
    *
    *  PROPERTIES
    *
    */
    const __INSTANCE = {
        id: parameters.id,
        type: parameters.type,
        value: parameters.value,
    }



    /*
    *
    *  GETTERS
    *
    */

    obj.getId = function(){return __INSTANCE.id;}
    obj.getType = function(){return __INSTANCE.type;}
    obj.getValue = function(){return __INSTANCE.value;}
};

module.exports = ObjectiveType;