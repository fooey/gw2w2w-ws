GLOBAL.dataReady = false;


if(process.env.NODETIME_ACCOUNT_KEY) {
    require('nodetime').profile({
        accountKey: process.env.NODETIME_ACCOUNT_KEY,
        appName: 'gw2w2w-ws' // optional
    });
}

console.log(Date.now(), 'Starting Node.js', process.version)




const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);


const config = require('./config/server')(app, express);
const routes = require('./routes')(app, express);


const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({server:  server});	// use the same server that the http server uses
const now = require('lodash').now;

GLOBAL.WebSocketServer = require('./lib/socketHandler');
GLOBAL.WebSocketServer.setServer(wss);
GLOBAL.WebSocketServer.start();


require('./lib/cache').init(
	require('./lib/dataUpdater').startUpdater()
);



//	start the http server listener
server.listen(app.get('port'), function(){
    console.log(now(), "Express server listening on port " + app.get('port'));
});


