
/**
 * Module dependencies.
 */
var express = require('express')
var app = express();
var http = require('http');

var config = require('./config.js')(app, express);
var routes = require('./routes')(app, express);



var now = new Date('1900-01-01');
GLOBAL.GW2 = GLOBAL.GW2 || {
    ready: false
    , langs: ['en', 'es', 'de', 'fr']
    , worldNames: {}
    , worldNamesById: {}
    , objectiveNames: {}
    , objectiveNamesById: {}
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



var server = http.createServer(app);

server.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});


var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({server:  server});
var wssHandler = new require('./lib/socketHandler.js')(wss);



var data = require('./lib/data.js');
data.init(wssHandler).updateData();