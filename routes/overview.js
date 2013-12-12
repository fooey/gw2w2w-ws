module.exports = function (req, res) {
    const urlLang = req.params.lang || 'en';

    if(!GLOBAL.dataReady){        
        require('./loading.js')(req, res);
    }
    else{
        var
            path = require('path');

        var
            worldsController = require(path.join(process.cwd(), 'lib/worlds')),
            matchesController = require(path.join(process.cwd(), 'lib/matches')),
            matchDetailsController = require(path.join(process.cwd(), 'lib/matchDetails'));

        var
            langs = require(path.join(process.cwd(), 'lib/anet')).getLangs();

        var
            worlds = {
                US: worldsController.getByRegion(urlLang, 'US'),
                EU: worldsController.getByRegion(urlLang, 'EU'),
            },
            matches = {
                US: matchesController.getByRegion('US'),
                EU: matchesController.getByRegion('EU'),
            };


        res.render('overview', {
            title: 'GuildWars2 WvW Objectives Tracker',

            langs: langs,

            lang: urlLang,
            matches: matches,
            worlds: worlds,
            scores: {},
        });
    }
};