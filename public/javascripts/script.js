var subscribeToUpdates = function (channel) {
    var wsHost = [
        'ws://'
        , window.location.hostname
        , ':'
        , window.location.port
        //, '/ws'
    ].join('');



    var wsClient = new WebSocket(wsHost);

    console.log('subscribeToUpdates', channel)

    wsClient.onopen = function () {
        wsClient.send(JSON.stringify({ event: 'subscribe', channel: channel }))
    };

    wsClient.onmessage = function (event) {

        var message = event.data;
        if (isJSON(message)) {
            message = JSON.parse(message);
        }
            
        if (channel === 'overview') {
            overviewEvents(message);
        }
        else{
            trackerEvents(message);
        }

        //console.log('Recieved WS Message: ', message);
    };
}

function overviewEvents(message){
    if (message.event && message.event === 'updateScore') {
        var $matchRows = $('.match' + message.matchId);

        $matchRows.each(function (i) {
            var $that = $(this);
            var score = Humanize.intcomma(message.scores[i]);
            $that
                .find('.score')
                .fadeOut('fast', function(){
                     $(this).text(score).fadeIn();
                })
               
        });
    }
}


function trackerEvents(message){}



function isJSON(data) {
    var isJson = false
    try {
        // this works with JSON string and JSON object, not sure about others
       var json = $.parseJSON(data);
       isJson = typeof json === 'object' ;
    } catch (ex) {}
    return isJson;
}