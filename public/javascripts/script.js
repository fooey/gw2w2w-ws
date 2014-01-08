
/*
*
*   ONLOAD and BEHAVIORS
*
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
});





/*
*
*   OVERVIEW
*
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





/*
*
*   TRACKER
*
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
    })
};






/*
*
*   WEB SOCKET EVENTS
*
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
*
*   UTILITY
*
*/

var waitingForReload = false;

var $alertDiv;
$(function(){
     $('<div id="priorityAlert" class="alert alert-danger" style="margin: 1em 0; padding: 1em; text-align: center; vertical-align: middle;"><h1>Application has requested a page reload</h1></div>').hide().prependTo('#content')
});


function reload(ms){
    // possible for multiple WS messages to trigger reloads, only allow one
    if(!waitingForReload){
        waitingForReload = true;
        console.log('Reloading in %d ms', ms);

       
        $('#priorityAlert').slideDown('fast');

        setTimeout(function(){

            $('#priorityAlert')
                .find('h3')
                    .fadeOut('fast', function(){
                        $(this).remove();
                    });

            $.ajax({
                url: window.location,
                type: 'head',
                timeout: (3*1000)
            }).done(function(data, textStatus, jqXHR){
                window.location.reload()
            }).fail(function(data, textStatus, jqXHR){
                console.log('*********************************');
                console.log(' App not ready, requeuing reload ');
                console.log('*********************************');

                $('#priorityAlert')
                    .css({minHeight: '160px'})
                    .append(
                         $('<h3>Application unavailable, requeuing page reload...</h3>')
                            .hide()
                            .fadeIn('fast')
                    );

                waitingForReload = false;
                reloadDelayed(4000, 8000);
            });
        }, ms);
    }
}
function reloadDelayed(msMin, msMax){
    if(msMin && !msMax){
        msMax = msMin;
    }
    else if(!msMin && !msMax){
        msMax = msMax || 1*1000;
        msMin = msMin || 3*1000;
    }
    var ms = ms || randRange(msMin, msMax);
    reload(ms);
}
function reloadNow(){
    reload(0);
}


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
    
    seconds = ('00' + seconds);
    seconds = seconds.substring(seconds.length-2, seconds.length);
    
    var txt = minutes + ':' +  seconds;
    
    return txt;
}

function randRange(rangeMin, rangeMax) {
    var randInRange = Math.round(
        (
            Math.random()
            * (rangeMax - rangeMin)
        )
        + rangeMin
    );
    return randInRange;
}