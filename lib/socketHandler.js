var uuid = require('uuid');
var _ = require('underscore');


var socketHandler = function (wss) {
    var self = this;
    self.wss = wss;


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





    self.broadcastToChannel = function (channel, data) {
        var message = JSON.stringify(data);
        _.each(self.wss.clients, function(client, ixClient){
             if (client.channel === channel) {
                try{
                    client.send(message);
                    console.log('WS Client Message:', client.uuid, message);
                }
                catch(excpt){} // retry mechanism
             }
        });
    };



    return self;
};



module.exports = socketHandler;