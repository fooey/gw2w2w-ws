"use strict"


module.exports = function(app, express){
    var routes = this;

    app.get('/:lang(en|es|de|fr)?', require('./overview.js'));
    app.get('/:lang(en|es|de|fr)/:worldName', require('./tracker.js'));

    app.get('/data/:dataType([A-Za-z]+)-:id([A-Za-z0-9\-]+).:extension', require('./data.js'));
    app.get('/data/:dataType([A-Za-z]+).:extension', require('./data.js'));
    

    app.get('/reset', function(req, res){
        require('../lib/cache').deleteCacheFiles('json', function(err){
            res.send('done');
            
            console.log(Date.now(), 'Data NOT Ready, Broadcast DESYNC Event')
            GLOBAL.WebSocketServer.broadcastToChannel('global', {event: 'desync'});
        });
    });

    return routes;
};