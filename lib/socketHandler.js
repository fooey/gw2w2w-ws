"use strict"

const uuid = require('uuid');
const _ = require('lodash');
const async = require('async');



/*
*
*   DEFINE EXPORT
*
*/

let Controller = {};
module.exports = Controller;



/*
*
*   PRIVATE PROPERITIES
*
*/
let WebSocketServer;

let messageQueue = {};
let processing = false;

const maxTimeSinceMessage = 20*1000;    //MS



/*
*
*   PUBLIC METHODS
*
*/

Controller.setServer = function (wss) {
    WebSocketServer = wss;
    WebSocketServer.on('connection', __onServerConnect);
};



Controller.start = function () {
    if(!processing){
        __processQueue();
        processing = true;
    }
};



Controller.broadcastToChannel = function (channel, toBroadcast) {
    //console.log('broadcastToChannel()', channel, toBroadcast)

    if(channel === 'global'){
        console.log(Date.now(), 'WSS Global Broadcast:', toBroadcast)
    }

    if(!messageQueue[channel]){
        messageQueue[channel] = [];
    }

    if(_.isArray(toBroadcast)){
        messageQueue[channel] = messageQueue[channel].concat(toBroadcast);
    }
    else{
        messageQueue[channel].push(toBroadcast);
    }
};




/*
*
*   PRIVATE METHODS
*
*/

const __processQueue = function __processQueue(){
    const now = Date.now();

    if(GLOBAL.dataReady){
        Controller.broadcastToChannel('loading', {event: 'resync'})
    }

    // copy and clear, so that messages can continue queueing without race conditions
    var _queue = _.cloneDeep(messageQueue);
    messageQueue = {};


    // stringify all the messages upfront, don't do it on each send()

    async.each(
        Object.keys(_queue),
        function(channel, callback){
            _queue[channel] = JSON.stringify(_queue[channel]);
        },
        function(err){if(err)throw(err)}
    );



    async.each(
        WebSocketServer.clients,
        function(client, nextClient){
            const clientTimeSinceMessage = now - client.lastMessaged;

            if(_queue['global']){
                client.lastMessaged = Date.now();
                client.send(_queue['global']);
            }
            else if(_queue[client.channel]){
                client.lastMessaged = Date.now();
                client.send(_queue[client.channel]);
            }
            else if(clientTimeSinceMessage > maxTimeSinceMessage){
                console.log(Date.now(), 'WS Client Ping:', client.uuid);
                client.ping();
                client.lastMessaged = Date.now();
            }
            nextClient(null)
        },
        function(err){if(err)throw(err)}
    );

    // intentionally not using setInterval(), this way it schedules the next batch AFTER completion
    setTimeout(__processQueue, _.random(7*1000, 9*1000))
};



/*
*   EVENT HANDLERS
*/

const __onServerConnect = function (client) {
    client.uuid = uuid.v1();
    client.lastMessaged = Date.now();

    console.log(Date.now(), 'WS Client Connected:', client.uuid);

    client.on('message', __onClientMessage.bind(client));
    client.on('close', __onClientClose.bind(client));
    client.on('error', __onClientError.bind(client));
}



const __onClientMessage = function (data, flags) {
    const message = JSON.parse(data);

    if(message.event) {
        if(message.event === 'subscribe') {
            this.channel = message.channel;
            this.send('Subscription successful: ' + this.channel);

            console.log(Date.now(), 'WS Client Subscribed:', this.channel, this.uuid);
        }
    }
    else {
        console.log(Date.now(), 'WS Client Unhandled Message:', message);
    }
}



const __onClientClose = function (code, message) {
    console.log(Date.now(), 'WS Client Disconnected:', this.uuid);
};



const __onClientError = function (error) {
    console.log(Date.now(), 'WS Client Error:', this.uuid, JSON.stringify(error));
};