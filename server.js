
var now = new Date('1900-01-01');
GLOBAL.GW2 = GLOBAL.GW2 || {
    ready: false
    , initTime: Date.now()
    , langs: ['en', 'es', 'de', 'fr']
    , worldNames: {}
    , worldNamesById: {}
    , objectives: {}
    , matches: {}
    , matchDetails: {}
    , matchDetailsPREV: {}
    , timeStamps: {
        worldNames: now
        , objectiveNames: now
        , matches: now
        , matchDetails: now
    }
};



/**
 * Module dependencies.
 */

var express = require('express')
var app = express();
var http = require('http');
var server = http.createServer(app);


var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({server:  server});
GLOBAL.wssHandler = new require('./lib/socketHandler.js')(wss);


GLOBAL.dataHandler = require('./lib/dataHandler.js')
GLOBAL.dataHandler.updateData();




var config = require('./config.js')(app, express);
var routes = require('./routes')(app, express);

server.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
