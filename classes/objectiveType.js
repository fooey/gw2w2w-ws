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
        timer: parameters.timer,
        value: parameters.value,
        type: parameters.type,
    }



    /*
    *
    *  GETTERS
    *
    */

    obj.getId = function(){return __INSTANCE.id;}
    obj.getValue = function(){return __INSTANCE.value;}
    obj.getTimer = function(){return __INSTANCE.timer;}
    obj.getType = function(){return __INSTANCE.type;}
};

module.exports = ObjectiveType;