module.exports = function (req, res) {
    var lang = req.params.lang;
    var worldName = req.params.worldName;
    var humanize = require('humanize');


    console.log('Render view: tracker')

    
    var waitForAppData = (function waitForAppData() {

        if (GLOBAL.GW2.ready) {
            res.render('tracker', {
                title: lang + ' Tracker'
                , lang: lang
                , humanize: humanize
                , dataHandler: GLOBAL.dataHandler
            });
        }
        else{
            setTimeout(waitForAppData, 100)
        }
    })();
};