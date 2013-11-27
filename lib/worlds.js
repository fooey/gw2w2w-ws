var slugify = require ('slug'),
    _ = require('underscore'),
    path = require('path'),
    fs = require('fs')

var WorldBean = require(path.join(GLOBAL.appRoot, '/beans/world.js'))


var world = function (){
    var self = this;


    self.store = function(worldsDataConcat, callback){
        //console.log('insertWorldsByLang(%s)', lang)

        var worlds = {};
        _.each(worldsDataConcat, function(worldsByLang, index){
            var lang = worldsByLang.lang;
            worlds[lang] = {};
            _.each(worldsByLang.data, function(world, ixWorld){
                worlds[lang][world.id] = new WorldBean({
                    id: world.id,
                    name: world.name,
                    lang: lang
                });
            })
        })

        GLOBAL.data.worlds = worlds;
        callback();
    };



    self.getWorldBySlug = function(lang, slug){
        return _.find(GLOBAL.data.worlds[lang], function(world){return world.slug === slug})
    }



    return self;
};



module.exports = new world();
