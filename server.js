"use strict"

GLOBAL.appRoot = __dirname;
GLOBAL.dataReady = false;


if(process.env.NODETIME_ACCOUNT_KEY) {
    require('nodetime').profile({
        accountKey: process.env.NODETIME_ACCOUNT_KEY,
        appName: 'gw2w2w-ws' // optional
    });
}



const
	express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app);

const
	config = require('./config/server.js')(app, express),
	routes = require('./routes')(app, express);

const
	WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({server:  server});	// use the same server that the http server uses

GLOBAL.wssHandler = new require('./lib/socketHandler.js')(wss);


require('./lib/dataUpdater.js').startUpdater();


//	start the http server listener
server.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});


