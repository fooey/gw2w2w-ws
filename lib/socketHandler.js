var path = require('path'),
    uuid = require('uuid'),
    _ = require('lodash'),
    async = require('async')

var myUtil = myUtil = require(path.join(GLOBAL.appRoot, '/lib/util.js'))


var socketHandler = function (wss) {
    var self = this;
    self.wss = wss;


    var messageQueue = {};
    var maxTimeSinceMessage = 20;    //seconds



    /*
    *
    *   EVENT HANDLERS
    *
    */
    wss.on('connection', function (client) {
        client.uuid = uuid.v1();
        client.lastMessaged = myUtil.now();

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
        messageQueue[channel] = messageQueue[channel] || [];
        messageQueue[channel].push(data);
    };
    


    /*
    *
    *   PRIVATE METHODS
    *
    */
    var processQueue = (function processQueue(){
        var now = myUtil.now();

        // copy and clear, so that messages can continue queueing without race conditions
        var _queue = _.cloneDeep(messageQueue);
        messageQueue = {};


        // convert all the buffered messages to JSON
        _.forEach(_queue, function(packet, channel){
            _queue[channel] = JSON.stringify(packet);
        })


        async.each(
            self.wss.clients,
            function(client, callback){
                var clientTimeSinceMessage = now - client.lastMessaged;

                if(_queue[client.channel]){
                    client.lastMessaged = myUtil.now();
                    client.send(_queue[client.channel]);
                }
                else if(clientTimeSinceMessage > maxTimeSinceMessage){
                    console.log('WS Client Ping:', client.uuid);
                    client.ping();
                    client.lastMessaged = myUtil.now();
                }
                callback()
            },
            function(err){if(err)throw(err)}
        );

        // intentionally not using setInterval(), this way it schedules the next batch in x seconds AFTER completing the current
        setTimeout(processQueue, _.random(1*1000, 2*1000))
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