var serverTimeOffset;

var subscribeToUpdates = function (channel, serverTime) {
    serverTimeOffset = serverTime - Math.floor(Date.now() / 1000);

    var wsHost = ['ws://', window.location.hostname, ':', window.location.port].join('');
    var wsClient = new WebSocket(wsHost);

    wsClient.onopen = function () {
        wsClient.send(JSON.stringify({ event: 'subscribe', channel: channel }))
    };
    wsClient.onclose = function () {
        //if the server drops connection, reload the page in 3 seconds
        setTimeout(window.location.reload(), (3*1000));
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
            default:
                trackerEvents(message);
                break;
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
                     $(this).text(score).fadeIn('fast');
                })
               
        });
    }
}


function trackerEvents(message){
    if (message.event && message.event === 'updateScore') {
        var eventArgs = message.arguments;
        console.log('update match scores', eventArgs.scores);

        var $scores = $('.totalScores .score');

        $scores.each(function (i) {
            var score = Humanize.intcomma(eventArgs.scores[i]);
            $(this)
                .fadeOut('fast', function(){
                     $(this).text(score).fadeIn('fast');
                })
               
        });
    }
    else if (message.event && message.event === 'newOwner') {
        var eventArgs = message.arguments;
        console.log('update objective owner', eventArgs);

        var $objective = $('#objective-' + eventArgs.objective.id);
        var $sprite = $objective.find('.sprite');

        $objective
            .removeClass('red green blue neutral')
            .addClass(eventArgs.objective.owner.toLowerCase())
            .data('lastcaptured', Math.floor(Date.now() / 1000))

        $sprite
            .removeClass('red green blue neutral')
            .addClass(eventArgs.objective.owner.toLowerCase())
       
    }
}



var retributionTimer = 5*60;
var updateTimers = (function updateTimers(){
    var now = Math.floor(Date.now() / 1000);
    var serverTime = now - serverTimeOffset;
    //console.log(now, serverTime);

    $('.objective').each(function(i){
        var $that = $(this);
        var lastCaptured = $that.data('lastcaptured');
        var timeHeld = serverTime - lastCaptured;
        $that.find('.timer').html(timeHeld)
        //console.log(lastCaptured)
    })

    setTimeout(updateTimers, 1000);
})();



function isJSON(data) {
    var isJson = false
    try {
        // this works with JSON string and JSON object, not sure about others
       var json = $.parseJSON(data);
       isJson = typeof json === 'object' ;
    } catch (ex) {}
    return isJson;
}