"use strict"


module.exports = function(app, express){
    var routes = this;

    app.get('/:lang([a-z]{2})?', require('./overview.js'));
    app.get('/:lang([a-z]{2})/:worldName', require('./tracker.js'));

    app.get('/data/:dataType([A-Za-z]+)-:matchId([0-9]\-[0-9]).:extension', require('./data.js'));
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