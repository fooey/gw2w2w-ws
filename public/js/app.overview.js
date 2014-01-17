/*!
*
*   APP.OVERVIEW
*
*/
(function(modules){
    "use strict"


    /*
    *
    *   DEFINE "EXPORT"
    */

    var overview = {};
    modules.overview = overview;



    /*
    *
    *   PRIVATE PROPERTIES
    *
    */

    var __INSTANCE = {
        chartOptions: {
            width: 90,
            height: 90,
            chartArea: {width: '100%', height: '100%'},
            colors: ['#a94442', '#31708f', '#3c763d'],
            enableInteractivity: false,
            pieSliceText: 'none',
            legend: {position: 'none'},
            tooltip: {textStyle: {
                fontSize: '9'
            }},
        },
    };
    var $overview;



    /*
    *
    *   DOM INIT
    *
    */

    $(function(){
        $overview = $('.overview');
        if($overview.length){
            window.modules.ws.addListener('updateScore', updateScore);
            initializePies();
        }
    });



    /*
    *
    *   PUBLIC METHODS
    *
    */

    

    /*
    *
    *   PRIVATE METHODS
    *
    */

    function initializePies(){
        async.each(
            $overview.find('.pie'),
            function(pie, nextPie){
                drawPie($(pie))
                nextPie(null)
            },
            _.noop
        );
    }



    function drawPie($pie){
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

        async.nextTick(function(){
            new google.visualization.PieChart(
                document.getElementById('pie'+matchId)
            ).draw(chartData, __INSTANCE.chartOptions);
        });

    }

    

    /*
    *   WS Events
    */

    function updateScore(packet){
        console.log('update match scores', packet.arguments);

        var eventArgs = packet.arguments;
        var $match = $('#match' + eventArgs.matchId);

        async.each(
            $match.find('.world'),
            function(world, nextWorld){
                var $world = $(world);
                var $score = $world.find('.score')

                var worldIndex = $world.data('worldindex');

                var curScore = $score.data("score");
                var newScore = eventArgs.scores[worldIndex];
                var diffScore = newScore - curScore;
                var prettyScore = Humanize.intcomma(newScore);

                $score
                    .data("score", newScore)
                    .text(prettyScore)

                if(diffScore){
                    animateScoreDiff($score, diffScore);
                }

                nextWorld(null);
            },
            function(err){
                async.nextTick(
                    drawPie.bind(null, $match.find('.pie'))
                );
            }
        );
    }

    function animateScoreDiff($score, diffScore){
        $score.prepend(
            $('<span>',{"class": "score-diff", "text": "+" + diffScore})
                .fadeIn(250, function(){
                    $(this)
                        .animate({"left": "0", "opacity": 0, "font-size": "45px"}, 750, function(){
                            $(this).remove();
                        });
                })
        );

    }



}(window.modules));