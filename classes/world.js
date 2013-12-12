"use strict"

const slugify = require ('slug');
const _ = require('lodash');


function World(parameters) {
    let obj = this;


    /*
    *
    *  PRIVATE PROPERTIES
    *
    */

    const __INSTANCE = {
        id: parseInt(parameters.id),
        name: parameters.name,
        lang: parameters.lang,
        //slug, link, region
    };



    /*
    *
    *  PUBLIC GETTERS
    *
    */

    obj.getId = function(){return __INSTANCE.id;}
    obj.getName = function(){return __INSTANCE.name;}
    obj.getLang = function(){return __INSTANCE.lang;}

    obj.getSlug = _.memoize(function(){
        return slugify(obj.getName().toLowerCase()).replace('\'', '');
    });

    obj.getLink = _.memoize(function(){
        return ['/', obj.getLang(), '/', obj.getSlug()].join('');
    });

    obj.getRegion = _.memoize(function(){
        if(obj.getId() >=  1000 && obj.getId() < 2000) return 'US';
        if(obj.getId() >=  2000 && obj.getId() < 3000) return 'EU';
    });
    
};

module.exports = World;





