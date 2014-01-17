/*!
*
*   APP.TRACKER.SCOREBOARD
*
*/
(function(modules){
    "use strict"


    /*
    *
    *   DEFINE "EXPORT"
    */

    var trackerScoreboard = {};
    modules.trackerScoreboard = trackerScoreboard;



    /*
    *
    *   PRIVATE PROPERTIES
    *
    */

    var __INSTANCE = {};
    var $log;



    /*
    *
    *   DOM INIT
    *
    */

    $(function(){
        window.modules.ws.addListener('updateScore', updateScore);
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

    /*
    *   WS Events
    */

    function updateScore(message){
        var eventArgs = message.arguments;
        console.log('update match scores', eventArgs.scores);

        async.each(
            $('#scoreBoards').find('.teamScoreBoard'),
            function(scoreBoard, nextScoreBoard){
                var $scoreBoard = $(scoreBoard);
                var worldIndex = $scoreBoard.data('worldindex');
                var score = Humanize.intcomma(eventArgs.scores[worldIndex]);
            
                $scoreBoard.find('.score').text(score)

                nextScoreBoard(null);
            },
            _.noop
        );
    }



}(window.modules));