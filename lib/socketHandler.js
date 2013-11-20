var uuid = require('uuid');
var _ = require('underscore');


var socketHandler = function (wss) {
    var self = this;
    self.wss = wss;

    self.channels = {'overview': []};
wss.channels = {'overview': []}

    wss.on('connection', function (client) {
        client.uuid = uuid.v1();
        console.log('WS Client Connected: ', client.uuid);

        client.on('message', function (message) {
            var data = JSON.parse(message);

            if (data.event && data.event === 'subscribe') {
                client.channel = data.channel;
                console.log('WS Client Subscription: ', client.channel, client.uuid);

                client.send(JSON.stringify('Subscription successful: ' + client.channel));

                wss.channels[client.channel].push(client.uuid);
            }
            else {
                console.log('received', data);
            }
        });
        client.on('close', function () {
            wss.channels[client.channel] = _.without(wss.channels[client.channel], client.uuid);
            console.log('WS Client Disconnected: ', client.uuid);
        });
    });

    self.broadcastToChannel = function (channel, data) {
        //console.log('broadcastToChannel', channel, data)
        for (var i in self.wss.clients) {
            if (self.wss.clients[i].channel === channel) {
                var message = JSON.stringify(data);
                self.wss.clients[i].send(message);
                console.log('send message ', message)
            }
        }
    };


    return self;
};



module.exports = socketHandler;