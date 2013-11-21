module.exports = function (req, res) {
    var lang = req.params.lang;
    var worldNameSlug = req.params.worldName;
    var humanize = require('humanize');


    console.log('Render view: tracker', lang, worldNameSlug)
    
    var world = GLOBAL.dataHandler.getWorldBySlug(lang, worldNameSlug);
    console.log('world:', world)

    var match = GLOBAL.dataHandler.getMatchByWorldId(world.id);
    console.log('match:', match)

    
    var waitForAppData = (function waitForAppData() {

        if (GLOBAL.GW2.ready) {
            res.render('tracker', {
                title: world.name + ' WvW Objectives Tracker'
                , lang: lang
                , humanize: humanize
                , world: world
                , match: match
                , dataHandler: GLOBAL.dataHandler
            });
        }
        else{
            setTimeout(waitForAppData, 100)
        }
    })();
};