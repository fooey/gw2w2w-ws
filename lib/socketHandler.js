var uuid = require('uuid');
var _ = require('underscore');


var socketHandler = function (wss) {
    var self = this;
    self.wss = wss;


    var messageQueue = {};


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
                console.log('received', message);
            }
        });

        client.on('close', function (code, message) {
            console.log('WS Client Disconnected:', client.uuid);
        });

        client.on('error', function (error) {
            console.log('WS Client Error:', client.uuid, JSON.stringify(error));
        });
    });

    self.init = function(wss){
        self.wss = wss
        return self
    }





    self.broadcastToChannel = function (channel, data) {
        if(!messageQueue[channel]){
            messageQueue[channel] = [];
        }
        messageQueue[channel].push(data);
    };


    var processQueue = (function processQueue(){
        console.log('wss.processQueue()');

        _.each(self.wss.clients, function(client, ixClient){
            var clientMessages = messageQueue[client.channel];

            console.log('WS Process Queue:', client.uuid, ' Channel:', client.channel);

            if(clientMessages){
                console.log('Packets:', clientMessages.length);
                client.send(JSON.stringify(clientMessages));
            }
            else{
                client.send(JSON.stringify({event: 'ping'}));
            }
        });


        //console.log('self.messageQueue()', self.messageQueue)
        messageQueue = {};
        setTimeout(processQueue, 10*1000)
    });
    
    // intentionally not using setInterval() this way it schedules the next batch in x seconds AFTER completing the current
    setTimeout(processQueue, 10*1000); 



    return self;
};



module.exports = socketHandler;