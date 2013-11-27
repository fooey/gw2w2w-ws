var humanize = require('humanize'),
    _ = require('underscore'),
    async = require('async'),
    path = require('path')

var worldsController = require(path.join(GLOBAL.appRoot, '/lib/worlds.js')),
    matchesController = require(path.join(GLOBAL.appRoot, '/lib/matches.js')),
    objectivesController = require(path.join(GLOBAL.appRoot, '/lib/objectives.js')),
    myUtil = require(path.join(GLOBAL.appRoot, '/lib/util.js'))


module.exports = function (req, res) {
    var lang = req.params.lang;
    var slug = req.params.worldName;

    var world = worldsController.getWorldBySlug(lang, slug);
    var match = matchesController.getMatchByWorldId(world.id);
    var scores = GLOBAL.data.matchDetails[match.id].scores;


    var mapNames = ['Eternal Battlegrounds'];
    _.each([match.getRedWorld(lang), match.getBlueWorld(lang), match.getGreenWorld(lang)], function(world, i){
        mapNames.push(world.name + ' Borderland');
    })

    var objectives = objectivesController.getAll();

    var matchDetails = GLOBAL.data.matchDetails[match.id];


    var matchObjectives = {};
    _.each(_.flatten(_.pluck(matchDetails.maps, 'objectives')), function(matchObjective, ix){
        matchObjectives[matchObjective.id] = matchObjective;
    });



    res.render('tracker', {
        title: world.name + ' WvW Objectives Tracker'
        , humanize: humanize
        , lang: lang
        , match: match
        , world: world
        , scores: scores

        , objectiveGroups: objectiveGroups
        , mapNames: mapNames
        , objectives: objectives
        , matchObjectives: matchObjectives
        , timestamp: myUtil.toUtcTimeStamp(Date.now())
        , objectiveState: GLOBAL.data.objectiveState[match.id]

        /*
        , objectives: objectives
        , objectivesMeta: GLOBAL.GW2.objectivesMeta
        , matchDetails: matchDetails
        , matchObjectives: matchObjectives
        , dataHandler: GLOBAL.dataHandler
        , objectiveCommonNames: objectiveCommonNames
        , worlds: worlds
        */
    });
};




/*



        //
            br
            div(class="row totalScores")
                each team, ixTeam in ['red','blue','green']
                    -var world = worlds[ixTeam]
                    div(class="col-md-4")
                        div(class="well team " + team)
                            h2(class="text-center")= world.name
                            h3(class="score text-center")= humanize.numberFormat(matchDetails.scores[ixTeam], 0)

            div(class="row")
                -var ixMap = 0;
                each objectiveGroup, objectiveGroupName in objectiveGroups
                    div(class="col-md-3", title=objectiveGroupName)
                        h5(class="text-center")= mapNames[ixMap++]
                        each section, sectionName in objectiveGroup
                            div(class=section.groupClass, title=sectionName)
                                ul(class="list-unstyled")
                                    each objectiveId, ixObjective in section.objectives
                                        -var matchObjective = matchObjectives[objectiveId];
                                        -var objectiveOwner = matchObjective.owner.toLowerCase()
                                        -var objectiveGuild = matchObjective.owner_guild
                                        -var objective = objectives[objectiveId][lang];
                                        -var liClass = ['objective', 'team', objectiveOwner, 'clearfix'].join(' ');
                                        -var oMeta = objectivesMeta[objectiveId];
                                        -var spriteClass = ['sprite', oMeta.type, objectiveOwner].join(' ');
                                        li(class=liClass, id="objective-" + objectiveId, data-lastcaptured=oMeta.lastCaptured)
                                            span(class=spriteClass)
                                            span(class="name")= objectiveCommonNames[lang][objectiveId]
                                            if objectiveGuild
                                                span(class='guild-' + objectiveGuild)
                                            span(class='timer') ??:??

*/


var neutralGroupClass = 'alert alert-warning';
var ruinsGroupClass = 'alert alert-warning';
var redGroupClass = 'alert alert-danger';
var blueGroupClass = 'alert alert-info';
var greenGroupClass = 'alert alert-success';

var objectiveGroups = {
    'Center': {
        'Castle':{
            groupClass: neutralGroupClass
            , objectives: [
                9           //sm
            ]
        }
        , 'Red Corner':{
            groupClass: redGroupClass
            , objectives: [
                1           //overlook
                , 20        //veloka
                , 17        //mendons
                , 18        //anz
                , 19        //ogre
                , 5         //pang
                , 6         //speldan
            ]
        }
        , 'Blue Corner':{
            groupClass: blueGroupClass
            , objectives: [
                2           //valley
                , 22        //bravost
                , 15        //langor
                , 16        //quentin
                , 21        //durios
                , 8         //umber
                , 7         //dane
            ]
        }
        , 'Green Corner':{
            groupClass: greenGroupClass
            , objectives: [
                3           //lowlands
                , 13        //jerrifer
                , 11        //aldons
                , 14        //klovan
                , 12        //wildcreek
                , 4         //golanta
                , 10        //rogues
            ]
        }
    }
    
    , 'RedHome': {
        'North':{
            groupClass: redGroupClass
            , objectives: [
                37          //keep
                , 33        //bay
                , 32        //hills
                , 38        //longview
                , 40        //cliffside
                , 39        //godsword
                , 52        //hopes
                , 51        //astral
            ]
        }
        ,'South':{
            groupClass: neutralGroupClass
            , objectives: [
                35          //briar
                , 36        //lake
                , 34        //lodge
                , 53        //vale
                , 50        //water
            ]
        }
        ,'Ruins':{
            groupClass: ruinsGroupClass
            , objectives: [
                62          //temple
                , 63        //hollow
                , 64        //estate
                , 65        //orchard
                , 66        //ascent
            ]
        }
    }
    
    , 'BlueHome': {
        'North':{
            groupClass: blueGroupClass
            , objectives: [
                23          //keep
                , 27        //bay
                , 31        //hills
                , 30        //woodhaven
                , 28        //dawns
                , 29        //spirit
                , 58        //gods
                , 60        //star
            ]
        }
        ,'South':{
            groupClass: neutralGroupClass
            , objectives: [
                25          //briar
                , 26        //lake
                , 24        //champ
                , 59        //vale
                , 61        //water
            ]
        }
        ,'Ruins':{
            groupClass: ruinsGroupClass
            , objectives: [
                71          //temple
                , 70        //hollow
                , 69        //estate
                , 68        //orchard
                , 67        //ascent
            ]
        }
    }
    
    , 'GreenHome': {
        'North':{
            groupClass: greenGroupClass
            , objectives: [
                46          //keep
                , 44        //bay
                , 41        //hills
                , 47        //sunny
                , 57        //crag
                , 56        //titan
                , 48        //faith
                , 54        //fog
            ]
        }
        ,'South':{
            groupClass: neutralGroupClass
            , objectives: [
                45          //briar
                , 42        //lake
                , 43        //lodge
                , 49        //vale
                , 55        //water
            ]
        }
        ,'Ruins':{
            groupClass: ruinsGroupClass
            , objectives: [
                76          //temple
                , 75        //hollow
                , 74        //estate
                , 73        //orchard
                , 72        //ascent
            ]
        }
    }
};