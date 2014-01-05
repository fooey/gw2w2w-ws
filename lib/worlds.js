"use strict"

const _ = require('lodash');
const async = require('async');

const anet = require('./anet');
const cache = require('./cache');


/*
*
*   DEFINE EXPORT
*
*/

let Controller = {};
module.exports = Controller;


/*
*
*   PUBLIC METHODS
*
*/



/*
*   INDIVIDUAL GETTERS
*/

Controller.getById = function(lang, id, getterCallback){
    Controller.getWorlds(function(err, worlds){
        getterCallback(err, worlds[id][lang]);
    });
};


Controller.getBySlug = function(lang, slug, getterCallback){
    Controller.getWorlds(function(err, worlds){
        getterCallback(err, _.find(worlds, function(world){return world[lang].slug === slug}));
    });
};



/*
*   MASS GETTERS
*/

Controller.getByLang = function(lang, getterCallback){
    throw('not implemented');
    // const qry = {lang: lang};
    // Controller.getWorlds(function(err, worlds){
    //     getterCallback(err, worlds);
    // });
};



Controller.getByRegion = function(lang, region, getterCallback){
    throw('not implemented');
    // const qry = {lang: lang, region: region};
    // Controller.getWorlds(qry, function(err, worlds){
    //     getterCallback(err, worlds);
    // });
};




/*
*   REMOTE DATA
*/

Controller.updateFromRemote = function(remoteUpdateDone){
    const startTime = Date.now();

    Controller.isReady(remoteUpdateDone, function onNotReady(){
        console.log(Date.now(), 'updateWorlds()');
        const langs = anet.langs;
        let worlds = [];

        async.each(
            langs,
            function(lang, nextLang){
                anet.getWorlds(lang.key, function(err, worldsData){
                    async.each(
                        worldsData
                        , function(world, netWorld){
                            world.lang = lang.key;
                            worlds.push(world);
                            netWorld(null);
                        }
                        , nextLang
                    )
                })
            },
            function(err){
                if(err){throw(err)}

                Controller.store(worlds, function(err, numWorlds){
                    console.log(Date.now(), 'updateWorlds() complete', Date.now() - startTime, 'elapsed')
                    remoteUpdateDone();
                });
            }
        )
    });
};




/*
*   DATA IO
*/


Controller.store = function(worldsData, storeDone){
    // build the collection of worlds to be stored
    let worlds = {};

    async.each(
        worldsData,
        function(worldData, nextWorld){
            worldData.id = parseInt(worldData.id);

            if(!worlds[worldData.id]){
                worlds[worldData.id] = {
                    id: worldData.id,
                    region: getRegion(worldData.id),
                };
            }

            const slug = getSlug(worldData.name);

            let world = {
                name: worldData.name,
                slug: slug,
                link: getLink(worldData.lang, slug),
            };

            worlds[worldData.id][worldData.lang] = world;

            nextWorld(null);
        },
        function(err){
            cache.write('worlds', worlds, storeDone);
        }
    );
};



Controller.getWorlds = function(getterCallback){
    cache.read('worlds', getterCallback);
};



/*
*   UTILITY
*/

Controller.isReady = function(onReady, onNotReady){
    const expectedCount = 51;
    let bool = false;

    cache.isLocalFresh('worlds', function onFresh(){
        Controller.getWorlds(function(err, worlds){
            const numWorlds = _.keys(worlds).length;
            bool = !!(numWorlds >= expectedCount)

            if(bool){
                onReady();
            }
            else{
                onNotReady();
            }
        });
    }, onNotReady);
};




/*
*
*   PRIVATE METHODS
*
*/


function getSlug(worldName){
    return require('slug')(worldName.toLowerCase()).replace('\'', '');
}


function getLink(lang, slug){
    return ['/', lang, '/', slug].join('');
}


function getRegion(worldId){
    if(worldId >=  1000 && worldId < 2000) return 'US';
    if(worldId >=  2000 && worldId < 3000) return 'EU';
}