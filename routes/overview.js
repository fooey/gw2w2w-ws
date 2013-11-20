module.exports = function (req, res) {
    var lang = req.params.lang || 'en';
    var humanize = require('humanize')
    var data = require('../lib/data.js')
    
    var waitForAppData = (function waitForAppData() {

        if (GLOBAL.GW2.ready) {
            res.render('overview', {
                title: lang + ' Overview'
                , lang: lang
                , data: data
                , humanize: humanize
            });
        }
        else{
            setTimeout(waitForAppData, 100)
        }
    })();

};