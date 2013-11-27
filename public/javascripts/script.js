$(function(){
    "use strict"


    var $overview = $('.overview');
    if($overview.length){
        $overview.find('.pie').each(function(){
            drawPie($(this));
        });
    }
})


var drawPie = function($pie){
    var $baseTR = $pie.closest('tr');
    var redScore = $baseTR.find('.score').data('score') || 0;
    var blueScore = $baseTR.next().find('.score').data('score') || 0;
    var greenScore = $baseTR.next().next().find('.score').data('score') || 0;

    var data = [{
        value: redScore,
        color:"#b94a48"
    },{
        value : blueScore,
        color : "#3a87ad"
    },{
        value : greenScore,
        color : "#468847"
    }];

    var ctx = $pie.find('canvas').get(0).getContext("2d");
    var myNewChart = new Chart(ctx).Pie(data, {animation: false, });
}






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
        var packets = event.data;

        if (isJSON(packets)) {
            packets = JSON.parse(packets);
        }

        if(!Array.isArray(packets)){
            packets = [packets];
        }

        _.each(packets, function(packet, index){            
            switch(channel){
                case 'overview':
                    overviewEvents(packet);
                    break;
                default:
                    trackerEvents(packet);
                    break;
            }
        })

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
                    .text(score)
               
        });

        drawPie($matchRows.find('.pie'));
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
                .text(score)
               
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



var buffTimer = 5*60;
var updateTimers = (function updateTimers(){
    var now = Math.floor(Date.now() / 1000);
    var serverTime = now - serverTimeOffset;
    //console.log(now, serverTime);

    if(serverTime){
        $('.objective').each(function(i){
            var $that = $(this);
            var lastCaptured = $that.data('lastcaptured');
            var timeHeld = serverTime - lastCaptured;

            if(timeHeld < buffTimer){
                $that.find('.timer').html(minuteFormat(buffTimer - timeHeld))
            }
            else{
                $that.find('.timer').text('')
                //$that.find('.timer').html('<small>+' + timeHeld + '</small>')
            }

            //console.log(lastCaptured)
        })
    }

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


function minuteFormat(seconds){
    var minutes = Math.floor(seconds / 60);
    seconds -= (minutes * 60);
    
    if(seconds === 0){
        seconds = '00';
    }
    else if(seconds < 10){
        seconds = '0' + seconds;
    }
    
    var txt = minutes + ':' +  seconds;
    
    return txt;
}