"use strict"

const async = require('async')
const _ = require('lodash')
const humanize = require('humanize')

const myUtil = require('../lib/util')

const worldsController = require('../lib/worlds');
const matchesController = require('../lib/matches');
const matchDetailsController = require('../lib/matchDetails');
const objectivesController = require('../lib/objectives');
const historyController = require('../lib/history');

const objectiveGroups = require('../lib/objectiveGroups');
const langs = require('../lib/anet').langs;
    


module.exports = function (req, res) {
    const urlLang = req.params.lang;
    const urlSlug = req.params.worldName;
    const renderStart = _.now();

    if(!GLOBAL.dataReady){
        require('./loading')(req, res);
    }
    else{
        async.waterfall([
            getWorld,
            getMatch,
            getMatchDetails,
            getObjectives,
            getHistory,
        ],function(err, results){
            //console.log('err', err)
            //console.log('results', results)

            const title = (results.world.name + ' WvW Objectives Tracker');

            res.render(
                'tracker'
                , {
                    title: title,

                    renderStart: renderStart,
                    urlLang: urlLang,
                    urlSlug: urlSlug,

                    langs: langs,
                    objectiveGroups: objectiveGroups,

                    world: results.world,
                    match: results.match,
                    matchDetails: results.matchDetails,
                    objectives: results.objectives,
                    history: results.history,

                }
            );

        });

        /*
        const world = worldsController.getWorldBySlug(lang, slug);
        const match = matchesController.getMatchByWorldId(lang, world.getId());
        const objectives = objectivesController.getAll();

        const matchDetails = matchDetailsController.getMatchDetails(match.getId());
        const matchObjectives = matchDetails.getObjectives();
        const scores = matchDetails.getScores();
        const mapNames = matchDetails.getMapNames(lang);



        res.render(
            'tracker'
            , {
                title: title
                , langs: langs

                , lang: lang
                , slug: slug
                
                , match: match
                , world: world
                , scores: scores

                , objectiveGroups: objectiveGroups
                , mapNames: mapNames
                , objectives: objectives
                , matchObjectives: matchObjectives
                , objectiveState: GLOBAL.data.objectiveState[match.getId()]
            }
        );
        */

    }







        

    function getWorld (callback){
        worldsController.getBySlug(urlLang, urlSlug, function(err, world){
            world.link = worldsController.getLink(urlLang, world.slug);

            callback(err, {world: world});
        });
    }


    function getMatch(data, getMatchCallback){
        matchesController.getByWorldId(data.world.id, function(err, match){
            async.parallel([
                function(next){
                    getMatchWorld(match, data.world, 'red', next);
                },
                function(next){
                    getMatchWorld(match, data.world, 'blue', next);
                },
                function(next){
                    getMatchWorld(match, data.world, 'green', next);
                },
            ], function(err, results){
                match.redWorld = results[0];
                match.blueWorld = results[1];
                match.greenWorld = results[2];

                data.match = match;

                getMatchCallback(null, data);
            });
        });
    }


    function getMatchDetails (data, callback){
        matchDetailsController.getById(data.match.id, function(err, matchDetails){
            matchDetails.scoresFormatted = _.map(matchDetails.scores, function(score) { return humanize.numberFormat(score, 0); });
            matchDetails.mapNames = [
                'Eternal Battlegrounds',
                data.match.redWorld.name + ' Borderland',
                data.match.blueWorld.name + ' Borderland',
                data.match.greenWorld.name + ' Borderland',
            ];

            data.matchDetails = matchDetails;
            callback(err, data);
        });
    }


    function getObjectives (data, callback){
        objectivesController.getObjectives(function(err, rawObjectives){
            async.each(
                rawObjectives
                , function(objective, next){
                    objective.objectiveType = objectivesController.getObjectiveType(objective.name);
                    objective.commonName = objectivesController.getCommonName(urlLang, objective.id);
                    objective.owner = 'neutral';
                    objective.lastCaptured = 0;
                    objective.guildId = null;
                    next(null);
                }
                , function(err){
                    let objectives = [];
                    _.forEach(rawObjectives, function(objective){
                        objectives[objective.id] = objective;
                    })
                    data.objectives = objectives;
                    callback(err, data);
                }
            );
        });
    }


    function getHistory(data, callback){
        historyController.get({matchId: data.match.id}, function(err, history){
            async.each(
                history,
                function(historyItem, next){
                    let objective = data.objectives[historyItem.objectiveId];
                    if(historyItem.eventType === 'newOwner'){
                        objective.lastCaptured = historyItem.timestamp;
                        objective.owner = historyItem.owner;
                    }
                    else if(historyItem.eventType === 'newClaimer'){
                        objective.guildId = historyItem.guildId;
                    }
                    next(null);
                },
                function(err){
                    data.history = history;
                    callback(err, data);
                }
            );

        });
    }





    function getMatchWorld(match, world, worldColor, callback){
        const worldKey = worldColor + 'WorldId';
        if(world.id === match[worldKey]){
            world.color = worldColor;
            callback(null, world);
        }
        else{
            worldsController.getById(urlLang, match[worldKey], callback)
        }
    }
};


/*


        br
        section.row.totalScores
            each world, worldIndex in [match.redWorld, match.blueWorld, match.greenWorld]
                -var team = ['red', 'blue', 'green'][worldIndex];
                div.col-md-4: div(class="team-score well team " + team)
                    h2.text-center= world.name()
                    h3.score.text-center(data-score=scores.numeric[worldIndex])= scores.formatted[worldIndex]

        //-
            div.row.objectives: div.col-md-12: div.row
                -var ixMap = 0;
                each objectiveGroup, objectiveGroupName in objectiveGroups
                    -var className = ['col-md-3', 'map'];
                    section(class=className, title=objectiveGroupName, id="map-" + objectiveGroupName.toLowerCase())
                        h4.map-name= mapNames[ixMap++]
                        each section, sectionName in objectiveGroup
                            -var className = [section.groupClass, 'objectives-group']
                            div(class=className, title=sectionName)
                                //h5= sectionName
                                ul.list-unstyled
                                    each objectiveId in section.objectives
                                        -var matchObjective = matchObjectives[objectiveId];
                                        -var objectiveOwner = matchObjective.owner.toLowerCase()
                                        -var objectiveGuild = matchObjective.owner_guild
                                        -var objectiveType = matchObjective.objective.getObjectiveType().getType()
                                        -var useTimer = matchObjective.objective.getObjectiveType().getTimer()
                                        //-var objective = objectivesController.getById(objectiveId);
                                        -var liClass = ['objective', 'team', objectiveOwner, 'clearfix'];
                                        -var spriteClass = ['sprite', objectiveOwner, objectiveType];
                                        li(class=liClass, id="objective-" + objectiveId, data-lastcaptured=objectiveState[objectiveId].lastCaptured)
                                            span(class=spriteClass)
                                            span.objective-name= matchObjective.objective.getCommonName(lang)
                                            if(objectiveGuild)
                                                span(class='guild-' + objectiveGuild)
                                            if(useTimer)
                                                span.timer

//-
    block worldLinks
        each world, worldIndex in [match.getRedWorld(lang), match.getBlueWorld(lang), match.getGreenWorld(lang)]
            -var team = ['red', 'blue', 'green'][worldIndex];
            -var liClass = ['team', team];
            if world.getSlug() == slug
                -liClass.push('active')
            li(class=liClass): a(class=['team', team], href=world.getLink())= world.getName()

*/