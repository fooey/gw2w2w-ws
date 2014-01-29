
/*!
*
*   APP.WSCLIENT
*
*/
(function(modules){
    "use strict"


    /*
    *
    *   DEFINE "EXPORT"
    */

    var ws = {};
    modules.ws = ws;



    /*
    *
    *   PRIVATE PROPERTIES
    *
    */

    var __INSTANCE = {};
    var __LISTENERS = {};



    /*
    *
    *   PUBLIC METHODS
    *
    */

    ws.subscribeToChannel = function (channel) {
        init(channel);
    };
    


    ws.addListener = function (event, listenerCallback) {
        //console.log('addListener', event);
        if(_.isArray(event)){
            async.each(event, function(thisEvent, nextEvent){
                ws.addListener(thisEvent, listenerCallback);
                nextEvent(null);
            }, _.noop);
        }
        else{
            __LISTENERS[event] = __LISTENERS[event] || [];
            __LISTENERS[event].push(listenerCallback);
        }
    };

    

    /*
    *
    *   PRIVATE METHODS
    *
    */

    function init(channel){
        __INSTANCE.channel = channel;
        __INSTANCE.client = new WebSocket(getHostPath());
        __INSTANCE.client.onclose = onClientClose;
        __INSTANCE.client.onmessage = onClientMessage;
        __INSTANCE.client.onopen = onClientOpen;
    }

    

    /*
    *   EVENT HANDLERS
    */

    function onClientOpen(){
        var packet = { event: 'subscribe', channel: __INSTANCE.channel };
        console.log('WS Send:', packet);
        __INSTANCE.client.send(JSON.stringify(packet))
    }



    function onClientClose(){
       window.modules.util.reloadDelayed();
    }



    function onClientMessage (event) {
        var packets = event.data;

        // console.log('Recieved WS Message: ', packets);

        if (window.modules.util.isJSON(packets)) {
            packets = JSON.parse(packets);
        }

        if(!Array.isArray(packets)){
            packets = [packets];
        }


        async.eachSeries(
            packets,
            function(packet, nextPacket){
                packet.event = packet.event || 'global';

                notifyListeners(packet, nextPacket);
            },
            function(err){
                _.defer(
                    window.modules.guilds.setPendingGuilds
                );
            }
        );

    }
    
    

    /*
    *   LISTENER HANDLERS
    */

    function getListeners(event) {
        return __LISTENERS[event];
    };
    


    function notifyListeners(packet, callback) {
        var listeners = getListeners(packet.event);

        if(!listeners || !listeners.length) {
            callback(null)
        }
        else{
            async.each(
                listeners,
                function(listener, nextListener){
                    listener(packet);
                    nextListener(null);
                },callback
            );
        }
    };




    /*
    *   UTIL
    */

    var getHostPath = _.memoize(function() {
        return [
            'ws://',
            window.location.hostname, 
            ':', 
            window.location.port
        ].join('');
    });



}(window.modules));