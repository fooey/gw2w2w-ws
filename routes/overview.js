module.exports = function (req, res) {
    var lang = req.params.lang || 'en';
    var humanize = require('humanize')
    
    console.log('Render view: overview')

    var waitForAppData = (function waitForAppData() {

        if (GLOBAL.GW2.ready) {
            res.render('overview', {
                title: lang + ' Overview'
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