"use strict"

const path = require('path');
const fs = require('fs');

const slugify = require ('slug');
const _ = require('lodash');

const World = require(path.join(process.cwd(), 'classes/world'));



/*
*
*   DEFINE EXPORT
*
*/

var WorldsController = {};
module.exports = WorldsController;



/*
*
*   PUBLIC METHODS
*
*/

WorldsController.store = function(worldsDataConcat, callback){
    //console.log('insertWorldsByLang(%s)', lang)

    let worlds = {};
    _.forEach(worldsDataConcat, function(worldsByLang, index){
        const lang = worldsByLang.lang;
        worlds[lang] = [];

        _.forEach(worldsByLang.data, function(world, ixWorld){
            worlds[lang].push(new World({
                id: world.id,
                name: world.name,
                lang: lang
            }));
        })

        // sort the worlds alphabetically
        worlds[lang] = _.sortBy(worlds[lang], function(world){return world.getName()});
    })

    GLOBAL.data.worlds = worlds;
    callback();
};



WorldsController.each = function(lang, callback){
    return _.forEach(GLOBAL.data.worlds[lang], callback);
};



/*
*   INDIVIDUAL GETTERS
*/

WorldsController.getWorldById = _.memoize(function(lang, id){
    return _.find(
        GLOBAL.data.worlds[lang]
        , function(world){return world.getId() == id}
    );
}, function(lang,id){return lang+id});

WorldsController.getWorldBySlug = _.memoize(function(lang, slug){
    return _.find(
        GLOBAL.data.worlds[lang]
        , function(world){return world.getSlug() === slug}
    );
}, function(lang,slug){return lang+slug});



/*
*   MASS GETTERS
*/

WorldsController.getByLang = function(lang){
    return GLOBAL.data.worlds[lang];
};

WorldsController.getByRegion = _.memoize(function(lang, region){
    return _.filter(
        WorldsController.getByLang(lang)
        , function(world){ return world.getRegion() === region; }
    );
}, function(lang,region){return lang+region});