var uuid = require('uuid');
var _ = require('underscore');


var socketHandler = function (wss) {
    var self = this;
    self.wss = wss;

    //self.channels = {'overview': []};
    wss.channels = {'overview': []}

    wss.on('connection', function (client) {
        client.uuid = uuid.v1();
        console.log('WS Client Connected: ', client.uuid);

        client.on('message', function (data, flags) {
            var message = JSON.parse(data);

            if (message.event && message.event === 'subscribe') {
                client.channel = message.channel;
                console.log('WS Client Subscribed: ', client.channel, client.uuid);

                client.send(JSON.stringify('Subscription successful: ' + client.channel));

                wss.channels[client.channel] = wss.channels[client.channel] || [];
                wss.channels[client.channel].push(client.uuid);
            }
            else {
                console.log('received', message);
            }
        });

        client.on('close', function (code, message) {
            console.log('WS Client Disconnected: ', client.uuid);
            wss.channels[client.channel] = _.without(wss.channels[client.channel], client.uuid);
        });

        client.on('error', function (error) {
            console.log('WS Client Error: ', client.uuid, JSON.stringify(error));
        });
    });



    self.broadcastToChannel = function (channel, data) {
        //console.log('broadcastToChannel', channel, data)
        for (var i in self.wss.clients) {
            if (self.wss.clients[i].channel === channel) {
                var message = JSON.stringify(data);
                try{
                    self.wss.clients[i].send(message);
                }
                catch(excpt){}

                console.log('send message ', message)
            }
        }
    };


    return self;
};



module.exports = socketHandler;