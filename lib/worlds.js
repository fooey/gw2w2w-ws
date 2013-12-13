"use strict"

const path = require('path');
const fs = require('fs');

const slugify = require ('slug');
const _ = require('lodash');
const async = require('async');

const db = require(path.join(process.cwd(), 'lib/db'));
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


        db.client.connect(db.url, function(err, db) {
            const collection = db.collection('worlds');

            async.each(
                worldsByLang.data
                , function(world, callback){
                    const worldArgs = {
                        _id: lang + world.id,
                        id: world.id,
                        name: world.name,
                        lang: lang,
                        slug: WorldsController.getSlug(world.name),
                        region: WorldsController.getRegion(world.id)
                    };
                    const thisWorld = new World(worldArgs);

                    worlds[lang].push(thisWorld);

                    collection.save(worldArgs, function(err, docs){
                        if (err) {console.error(err)}

                        callback()
                    });
                }
                , function(err){}
            );

            collection.ensureIndex({name:1}, _.noop);
            collection.ensureIndex({lang:1, slug: 1}, _.noop);
            collection.ensureIndex({lang:1, region: 1}, _.noop);

        });

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




/*
*   UTILITY
*/

WorldsController.getSlug = function(worldName){
    return slugify(worldName.toLowerCase()).replace('\'', '');
}


WorldsController.getRegion = function(worldId){
    if(worldId >=  1000 && worldId < 2000) return 'US';
    if(worldId >=  2000 && worldId < 3000) return 'EU';
}