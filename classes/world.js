"use strict"
const path = require ('path');

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
        slug: parameters.slug,
        region: parameters.region,
        link: ['/', parameters.lang, '/', parameters.slug].join(''),
    };



    /*
    *
    *  PUBLIC GETTERS
    *
    */

    obj.getId = function(){return __INSTANCE.id;}
    obj.getName = function(){return __INSTANCE.name;}
    obj.getLang = function(){return __INSTANCE.lang;}
    obj.getSlug = function(){return __INSTANCE.slug;}
    obj.getRegion = function(){return __INSTANCE.region;}
    obj.getLink = function(){return __INSTANCE.link;}
    
};

module.exports = World;





