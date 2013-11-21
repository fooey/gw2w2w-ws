var subscribeToUpdates = function (channel) {
    var wsHost = ['ws://', window.location.hostname, ':', window.location.port].join('');
    var wsClient = new WebSocket(wsHost);

    wsClient.onopen = function () {
        wsClient.send(JSON.stringify({ event: 'subscribe', channel: channel }))
    };

    wsClient.onmessage = function (event) {

        var message = event.data;

        if (isJSON(message)) {
            message = JSON.parse(message);
        }
        
        switch(channel){
            case 'overview':
                overviewEvents(message);
                break;
            case 'tracker':
                trackerEvents(message);
                break;
            default:
                console.log('Invalid Channel: ', channel)
        }

        //console.log('Recieved WS Message: ', message);
    };
}

function overviewEvents(message){
    if (message.event && message.event === 'updateScore') {
        var eventArgs = message.arguments;
		console.log('update match scores', eventArgs.matchId);
        var $matchRows = $('.match' + eventArgs.matchId);

        $matchRows.each(function (i) {
            var $that = $(this);
            var score = Humanize.intcomma(eventArgs.scores[i]);
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