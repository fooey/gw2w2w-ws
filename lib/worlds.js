"use strict"

const slugify = require ('slug');
const _ = require('lodash');
const async = require('async');

const myUtil = require('./util');




/*
*
*   DEFINE EXPORT
*
*/

var Controller = {};
module.exports = Controller;


/*
*
*   PUBLIC METHODS
*
*/

Controller.isReady = function(callback){
    const expectedCount = 204;

    dbGetCollection(function(err, db, collection){
        collection.count(function(err, count){
            db.close();
            //console.log(err, count, expectedCount, !!(count >= expectedCount));
            callback(!!(count >= expectedCount));
        });
    });
};


Controller.store = function(worldsData, storeDone){
    async.waterfall([
        function(wfNext){
            // build the array of docs to be sent to the database
            async.concat(
                worldsData,
                function(world, concatWorld){
                    world.id = parseInt(world.id);

                    concatWorld(null, {
                        _id: (world.lang + world.id),
                        id: parseInt(world.id),
                        name: world.name,
                        lang: world.lang,
                        slug: Controller.getSlug(world.name),
                        region: Controller.getRegion(world.id),
                    });
                },
                wfNext//(err, worlds)
            );

        },

        // truncate, insert, reindex
        function(docs, wfDone){
            dbGetCollection(function(err, db, collection){
                async.series([

                    //truncate old, insert new
                    function(seriesNext){
                        collection.remove({}, function(err, data){
                            collection.insert(docs, seriesNext)
                        })
                    },

                    //set indexes
                    function(seriesNext){
                        async.parallel([
                            function(indexCallback){collection.ensureIndex({lang:1, slug:1}, indexCallback)},
                            function(indexCallback){collection.ensureIndex({lang:1, name:1}, indexCallback)},
                            function(indexCallback){collection.ensureIndex({lang:1, region:1, name:1}, indexCallback)},
                        ], seriesNext);
                    },

                    

                    //drop db connection
                    function(seriesDone){
                        db.close(seriesDone)
                    },
                ],wfDone);
            })
        },
    ],storeDone);
};


Controller.asyncEach = function(lang, iterator, done){
    if(!_.isString(lang)){
        throw('Invalid argument for lang: ', lang)
    }
    const qry = {lang: lang};

    Controller.getWorlds(qry, function(err, worlds){
        async.each(worlds, iterator, done);
    });
};


Controller.forEach = function(lang, iterator){
    if(!_.isString(lang)){
        throw('Invalid argument for lang: ', lang)
    }
    const qry = {lang: lang};

    Controller.getMatches(qry, function(err, worlds){
        _.forEach(worlds, iterator);
    });
};



/*
*   INDIVIDUAL GETTERS
*/

Controller.getWorld = function(qry, getterCallback){
    if(!qry){
        throw('qry required for Controller.getWorld()');
    }

    dbGetCollection(function(err, db, collection){
        collection.findOne(qry, function(err, world){
            if(err){console.log('ERROR IN worlds.getWorld().db.worlds.find()', err)}
            db.close();

            getterCallback(null, world);
        });
    });
};


Controller.getById = function(lang, id, getterCallback){
    const qry = {lang: lang, id: id};

    Controller.getWorld(qry, function(err, world){
        getterCallback(err, world);
    });
};


Controller.getBySlug = function(lang, slug, getterCallback){
    const qry = {lang: lang, slug: slug};

    Controller.getWorld(qry, function(err, world){
        getterCallback(err, world);
    });
};



/*
*   MASS GETTERS
*/

Controller.getWorlds = function(qry, getterCallback){
    if(arguments.length === 1){
        getterCallback = arguments[0];
        qry = {};
    }
    qry = qry || {};

    dbGetCollection(function(err, db, collection){
        collection.find(qry).sort({name:1}).toArray(function(err, worlds){
            if(err){console.log('ERROR IN worlds.getWorlds().db.worlds.find()', err)}
            db.close();

            getterCallback(err, worlds);
        });
    });
};



Controller.getByLang = function(lang, getterCallback){
    const qry = {lang: lang};
    Controller.getWorlds(qry, function(err, worlds){
        getterCallback(err, worlds);
    });
};



Controller.getByRegion = function(lang, region, getterCallback){
    const qry = {lang: lang, region: region};
    Controller.getWorlds(qry, function(err, worlds){
        getterCallback(err, worlds);
    });
};




/*
*   UTILITY
*/


Controller.getSlug = function(worldName){
    return slugify(worldName.toLowerCase()).replace('\'', '');
}


Controller.getLink = function(lang, slug){
    return ['/', lang, '/', slug].join('');
}


Controller.getRegion = function(worldId){
    if(worldId >=  1000 && worldId < 2000) return 'US';
    if(worldId >=  2000 && worldId < 3000) return 'EU';
}


/*
*
*   PRIVATE METHODS
*
*/

const dbGetCollection = function(callback){
    const db = require('./db');

    require('./db').getCollection('worlds', callback);
};