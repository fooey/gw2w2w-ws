module.exports = function (req, res) {
    var lang = req.params.lang || 'en';
    var humanize = require('humanize');
    var _ = require('underscore')

    var worlds = {
        'US': GLOBAL.dataHandler.getWorldsByRegion('US', lang)
        , 'EU': GLOBAL.dataHandler.getWorldsByRegion('EU', lang)
    };
    worlds.US = _.sortBy(worlds.US, 'name')
    worlds.EU = _.sortBy(worlds.EU, 'name')

    var matches = {
        'US': GLOBAL.dataHandler.getMatchesByRegion('US')
        , 'EU': GLOBAL.dataHandler.getMatchesByRegion('EU')
    };
    
    console.log('Render view: overview')

    var waitForAppData = (function waitForAppData() {

        if (GLOBAL.GW2.ready) {
            res.render('overview', {
                title: lang + ' Overview'
                , lang: lang
                , humanize: humanize
                , worlds: worlds
                , matches: matches
                , dataHandler: GLOBAL.dataHandler
            });
        }
        else{
            setTimeout(waitForAppData, 100)
        }
    })();

};