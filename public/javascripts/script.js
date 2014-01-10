/*!
*
*   APP
*
*/


/*!
*   ONLOAD and BEHAVIORS
*/

var $overview, $tracker;

$(function(){
    $overview = $('.overview');
    if($overview.length){
        $overview.find('.pie').each(function(){
            drawPie($(this));
        });
    }

    
    $tracker = $('#tracker');
    if($tracker.length){
        updateTimers()
        setInterval(updateTimers, 1000);
    };


    $log = $('#log');
    if($log.length){
        initLog($log);
    };


});





/*!
*   OVERVIEW
*/

var chartOptions = {
    width: 90,
    height: 90,
    chartArea: {width: '100%', height: '100%'},
    colors: ['#a94442', '#31708f', '#3c763d'],
    enableInteractivity: false,
    pieSliceText: 'none',
    legend: {position: 'none'},
    tooltip: {textStyle: {
        fontSize: '9'
    }}
};
var drawPie = function($pie){
    var $match = $pie.closest('.match');
    var matchId = $match.data('matchid');

    var $red = $match.find('.world.red');
    var redTeam = $red.find('a').text();
    var redScore = $red.find('.score').data('score') || 0;

    var $blue = $match.find('.world.blue');
    var blueTeam = $blue.find('a').text();
    var blueScore = $blue.find('.score').data('score') || 0;

    var $green = $match.find('.world.green');
    var greenTeam = $green.find('a').text();
    var greenScore = $green.find('.score').data('score') || 0;

    var chartData = google.visualization.arrayToDataTable([
        ['Team', 'Score'],
        [redTeam, redScore],
        [blueTeam, blueScore],
        [greenTeam, greenScore],
    ]);

    new google.visualization.PieChart(document.getElementById('pie'+matchId)).draw(chartData, chartOptions);
}





/*!
*   TRACKER
*/

var buffTimer = 5*60;
var updateTimers = function updateTimers(){
    var now = Math.floor(Date.now() / 1000);

    $tracker.find('.objective').each(function(i){
        var $that = $(this);
        var lastCaptured = $that.data('lastcaptured');
        var timeHeld = now - lastCaptured;

        if(timeHeld < buffTimer){
            $that.find('.timer').show().html(minuteFormat(buffTimer - timeHeld))
        }
        else{
            $that.find('.timer:visible').text('').hide();
            //$that.find('.timer').html('<small>+' + timeHeld + '</small>')
        }

        //console.log(lastCaptured)
    });

    $('#logEntries .logEntry').each(function(i){
        var $that = $(this);
        var timestamp = $that.data('timestamp');
        var dateObj = new Date(timestamp*1000);
        var timeText = dateFormat(dateObj, 'hh:mm:ss');
        $that.find('.timestamp').html(timeText);
    });
};





/*!
*   LOG
*/

function initLog($log){
    console.log('initLog()');

    $log.find('.logEntry')
        .on('mouseenter', function(){
            var $that = $(this);
            var objectiveId = $that.data('objectiveid');
            var $objective = $('#objective-' + objectiveId);
            $objective.addClass('active');
        })
        .on('mouseout', function(){
            var $that = $(this);
            var objectiveId = $that.data('objectiveid');
            var $objective = $('#objective-' + objectiveId);
            $objective.removeClass('active');
        });

    $log.find('#logtabs a')
        .on('click', function(){
            var $that = $(this);
            var mapName = $that.data('mapname');

            $that.closest('li')
                .addClass('active')
                .siblings()
                    .removeClass('active');

            if(mapName === 'All'){
                $log
                    .find('.mapName:hidden')
                        .show()
                    .end()
                    .find('.logEntry:hidden')
                        .show()
                    .end();
            }
            else{
                $log
                    .find('.mapName:visible')
                        .hide()
                    .end()
                    .find('.logEntry:visible')
                        .hide()
                    .end()
                    .find('.logEntry.' + mapName)
                        .show()
                    .end();
            }
        });
}




/*!
*   WEB SOCKET EVENTS
*/
var subscribeToUpdates = function (channel) {
    var wsHost = ['ws://', window.location.hostname, ':', window.location.port].join('');
    var wsClient = new WebSocket(wsHost);

    console.log('Subscribing to channel', channel)

    wsClient.onopen = function () {
        var packet = { event: 'subscribe', channel: channel };
        console.log('WS Send:', packet);
        wsClient.send(JSON.stringify(packet))
    };
    wsClient.onclose = function () {
        reloadDelayed();
    };

    wsClient.onmessage = function (event) {
        var packets = event.data;

        console.log('Recieved WS Message: ', packets);

        if (isJSON(packets)) {
            packets = JSON.parse(packets);
        }

        if(!Array.isArray(packets)){
            packets = [packets];
        }

        _.forEach(packets, function(packet, index){

            if(packet.event && (
                packet.event === 'resync'
                || packet.event === 'desync'
            )){
                globalEvents(packet);
            }
            else{
                switch(channel){
                    case 'global':
                    case 'loading':
                        globalEvents(packet);
                        break;

                    case 'overview':
                        overviewEvents(packet);
                        break;

                    default:
                        trackerEvents(packet);
                        break;
                }
            }
        })

    };
}



function globalEvents(message){
    console.log('WS Global:', message)
    if (message.event){
        switch(message.event){
            case 'desync':
            case 'resync':
            case 'reset':
                reloadDelayed();
                break;
        }
    }
}



function overviewEvents(message){

    if (message.event){
        if(message.event === 'updateScore') {
            var eventArgs = message.arguments;
    		console.log('update match scores', eventArgs.matchId);
            var $match = $('#match' + eventArgs.matchId);

            $match.find('.world').each(function (i) {
                var $that = $(this);
                var score = Humanize.intcomma(eventArgs.scores[i]);
                $that
                    .find('.score')
                        .text(score)
                   
            });

            drawPie($match.find('.pie'));
        }
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

        var $objective = $('#objective-' + eventArgs.objectiveId);
        var $sprite = $objective.find('.sprite');

        $objective
            .removeClass('red green blue neutral')
            .addClass(eventArgs.owner.toLowerCase())
            .data('lastcaptured', eventArgs.timestamp)

        $sprite
            .removeClass('red green blue neutral')
            .addClass(eventArgs.owner.toLowerCase())
       
    }
}





/*
*   UTILITY
*/

var waitingForReload = false;

var $alertDiv;
$(function(){
     $('<div id="priorityAlert" class="alert alert-danger" style="margin: 1em 0; padding: 1em; text-align: center; vertical-align: middle;"><h1>Application has requested a page reload</h1></div>').hide().prependTo('#content')
});