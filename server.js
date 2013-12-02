var _ = require('underscore')

require('newrelic'); // monitoring
GLOBAL.appRoot = __dirname;



/**
 * Module dependencies.
 */

var express = require('express')
var app = express();
var http = require('http');
var server = http.createServer(app);

var config = require('./config/server.js')(app, express);
var routes = require('./routes')(app, express);


var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({server:  server});

    
GLOBAL.wssHandler = new require('./lib/socketHandler.js')(wss);

require('./lib/dataUpdater.js').startUpdater(function(){
    server.listen(app.get('port'), function(){
        console.log("Express server listening on port " + app.get('port'));
    });
});



