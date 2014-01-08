"use strict"


module.exports = function(app, express){
    var routes = this;

    app.get('/stylesheets/style.min.css', require('./style.js'));
    

    app.get('/:lang([a-z]{2})?', require('./overview.js'));
    app.get('/:lang([a-z]{2})/:worldName', require('./tracker.js'));


    app.get('/journal/:matchId?.:ext?', require('./history.js'));



    app.get('/reset', function(req, res){
        const fs = require('fs');
        const path = require('path');
        const async = require('async');

        const cacheFolder = require('../lib/cache').getCacheFolder();

		fs.readdir(cacheFolder, function(err, files){
            async.each(
                files,
                function(fileName, nextFile){
                    const splitFile = fileName.split('.');
                    if(splitFile[splitFile.length-1] === 'json'){
                        fs.unlink(path.join(cacheFolder, fileName), nextFile);
                    }
                    else{
                        nextFile()
                    }
                },
                function(err){
                    res.send('done');
                    
                    console.log(Date.now(), 'Data NOT Ready, Broadcast DESYNC Event')
                    GLOBAL.WebSocketServer.broadcastToChannel('global', {event: 'desync'});
                }
            );
		});
    });

    return routes;
};