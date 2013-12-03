var uuid = require('uuid'),
    _ = require('lodash'),
    path = require('path');

var myUtil = myUtil = require(path.join(GLOBAL.appRoot, '/lib/util.js'))


var socketHandler = function (wss) {
    var self = this;
    self.wss = wss;


    var messageQueue = {};



    /*
    *
    *   EVENT HANDLERS
    *
    */
    wss.on('connection', function (client) {
        client.uuid = uuid.v1();
        console.log('WS Client Connected: ', client.uuid);

        client.on('message', function (data, flags) {
            var message = JSON.parse(data);

            if (message.event && message.event === 'subscribe') {
                client.channel = message.channel;
                console.log('WS Client Subscribed:', client.channel, client.uuid);

                client.send(JSON.stringify('Subscription successful:' + client.channel));
            }
            else {
                console.log('WS Client Message:', message);
            }
        });

        client.on('close', function (code, message) {
            console.log('WS Client Disconnected:', client.uuid);
        });

        client.on('error', function (error) {
            console.log('WS Client Error:', client.uuid, JSON.stringify(error));
        });
    });
    


    /*
    *
    *   PUBLIC METHODS
    *
    */
    self.broadcastToChannel = function (channel, data) {
        if(!messageQueue[channel]){
            messageQueue[channel] = [];
        }
        messageQueue[channel].push(data);
    };
    


    /*
    *
    *   PRIVATE METHODS
    *
    */
    var processQueue = (function processQueue(){
        if(hasClients() && hasMessagesQueued()){
            console.log('wss.processQueue() %s messages', getNumMessages());

            _.forEach(self.wss.clients, function(client, ixClient){
                if(messageQueue[client.channel]){
                    client.send(JSON.stringify(messageQueue[client.channel]));
                }
                else{
                    client.send(JSON.stringify({event: 'ping'}));
                }
            });

            messageQueue = {};
        }

        // intentionally not using setInterval(), this way it schedules the next batch in x seconds AFTER completing the current
        setTimeout(processQueue, _.random(8*1000, 16*1000))
    })();//auto execute


    function hasClients(){
        return (!!self.wss.clients.length);
    }


    function hasMessagesQueued(){
        return (!!_.keys(messageQueue).length);
    }


    function getNumMessages(){
        var numMessages = 0;
        _.forEach(messageQueue, function(chan, ixChan){
            numMessages += _.flatten(chan).length;
        })
        return numMessages;
    }



    return self;
};



module.exports = socketHandler;