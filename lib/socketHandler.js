"use strict"

const uuid = require('uuid');
const _ = require('lodash');
const async = require('async');

const myUtil = require('./util');



/*
*
*   DEFINE EXPORT
*
*/

var SocketHandler = {};
module.exports = SocketHandler;



/*
*
*   PRIVATE PROPERITIES
*
*/
var WebSocketServer;

var messageQueue = {};
var processing = false;

const maxTimeSinceMessage = 20;    //seconds



/*
*
*   PUBLIC METHODS
*
*/

SocketHandler.setServer = function (wss) {
    WebSocketServer = wss;
    WebSocketServer.on('connection', onServerConnect);
};



SocketHandler.start = function () {
    if(!processing){
        processQueue();
        processing = true;
    }
};



SocketHandler.broadcastToChannel = function (channel, toBroadcast) {
    if(channel === 'global'){
        console.log(_.now(), 'WSS Global Broadcast:', toBroadcast)
    }
    messageQueue[channel] = messageQueue[channel] || [];

    if(_.isArray(toBroadcast)){
        messageQueue[channel].concat(toBroadcast);
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

const processQueue = function processQueue(){
    const now = myUtil.now();

    if(GLOBAL.dataReady){
        SocketHandler.broadcastToChannel('loading', {event: 'resync'})
    }

    // copy and clear, so that messages can continue queueing without race conditions
    var _queue = _.cloneDeep(messageQueue);
    messageQueue = {};


    // stringify all the messages upfront, don't do it on each send()
    async.each(
        _.keys(_queue),
        function(channel, callback){
            _queue[channel] = JSON.stringify(_queue[channel]);
        },
        function(err){if(err)throw(err)}
    );


    async.each(
        WebSocketServer.clients,
        function(client, callback){
            const clientTimeSinceMessage = now - client.lastMessaged;

            if(_queue['global']){
                client.lastMessaged = myUtil.now();
                client.send(_queue['global']);
            }
            else if(_queue[client.channel]){
                client.lastMessaged = myUtil.now();
                client.send(_queue[client.channel]);
            }
            else if(clientTimeSinceMessage > maxTimeSinceMessage){
                console.log(_.now(), 'WS Client Ping:', client.uuid);
                client.ping();
                client.lastMessaged = myUtil.now();
            }
            callback()
        },
        function(err){if(err)throw(err)}
    );

    // intentionally not using setInterval(), this way it schedules the next batch in x seconds AFTER completing the current
    setTimeout(processQueue, _.random(1*1000, 3*1000))
};



/*
*   EVENT HANDLERS
*/

const onServerConnect = function (client) {
    client.uuid = uuid.v1();
    client.lastMessaged = myUtil.now();

    console.log(_.now(), 'WS Client Connected:', client.uuid);

    client.on('message', onClientMessage.bind(client));
    client.on('close', onClientClose.bind(client));
    client.on('error', onClientError.bind(client));
}



const onClientMessage = function (data, flags) {
    const message = JSON.parse(data);

    if(message.event) {
        if(message.event === 'subscribe') {
            this.channel = message.channel;
            this.send('Subscription successful: ' + this.channel);

            console.log(_.now(), 'WS Client Subscribed:', this.channel, this.uuid);
        }
    }
    else {
        console.log(_.now(), 'WS Client Unhandled Message:', message);
    }
}



const onClientClose = function (code, message) {
    console.log(_.now(), 'WS Client Disconnected:', this.uuid);
};



const onClientError = function (error) {
    console.log(_.now(), 'WS Client Error:', this.uuid, JSON.stringify(error));
};