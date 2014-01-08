"use strict"

const async = require('async')
const _ = require('lodash')
const humanize = require('humanize')

const worldsController = require('../lib/worlds');
const matchesController = require('../lib/matches');
const matchDetailsController = require('../lib/matchDetails');
const objectivesController = require('../lib/objectives');
const stateController = require('../lib/objectiveState');

const objectiveGroups = require('../lib/objectiveGroups');
    


module.exports = function (req, res) {
    const urlLang = req.params.lang;
    const urlSlug = req.params.worldName;
    const renderStart = Date.now();

    if(!GLOBAL.dataReady){
        require('./loading')(req, res);
    }
    else{
        // async.waterfall([
        //     getWorld,
        //     getMatch,
        //     getMatchDetails,
        //     getObjectives,
        //     getObjectiveState,
        // ],function(err, results){
        //     //console.log('err', err)
        //     //console.log('results', results)

        // });

        async.auto({
            world: getWorld,
            match: ['world', getMatch],
            matchDetails: ['match', getMatchDetails],

            objectives: getObjectives,
            objectiveState: ['match', getObjectiveState],
            journal: ['objectiveState', getJournal],

        }, function (err, results){
            //console.log(arguments);

            const title = (results.world[urlLang].name + ' WvW Objectives Tracker');

            res.render(
                'tracker'
                , {
                    title: title,

                    renderStart: renderStart,
                    urlLang: urlLang,
                    urlSlug: urlSlug,

                    langs: require('../lib/anet').langs,
                    objectiveGroups: objectiveGroups,

                    world: results.world,
                    match: results.match,
                    matchDetails: results.matchDetails,
                    objectives: results.objectives,
                    objectiveState: results.objectiveState,

                    journal: results.journal,
                }
            );
        });
    }


    





        

    function getWorld (getWorldCallback){
        worldsController.getBySlug(urlLang, urlSlug, getWorldCallback);
    }


    function getMatch(getMatchCallback, data){
        matchesController.getByWorldId(data.world.id, function(err, match){
            worldsController.getWorlds(function(err, worlds){
                match.redWorld = worlds[match.redWorldId];
                match.blueWorld = worlds[match.blueWorldId];
                match.greenWorld = worlds[match.greenWorldId];

                getMatchCallback(null, match);
            });
        });
    }


    function getMatchDetails (getMatchDetailsCallback, data){
        matchDetailsController.getById(data.match.id, function(err, matchDetails){
            matchDetails.scoresFormatted = _.map(matchDetails.scores, function(score) { return humanize.numberFormat(score, 0); });
            matchDetails.mapNames = [
                'Eternal Battlegrounds',
                data.match.redWorld[urlLang].name + ' Borderland',
                data.match.blueWorld[urlLang].name + ' Borderland',
                data.match.greenWorld[urlLang].name + ' Borderland',
            ];

            getMatchDetailsCallback(err, matchDetails);
        });
    }


    function getObjectives (getObjectivesCallback){
        objectivesController.getObjectives(getObjectivesCallback);
    }


    function getObjectiveState (getObjectiveStateCallback, data){
        stateController.getById(data.match.id, getObjectiveStateCallback);
    }


    function getJournal (getJournalCallback, data){
        let journal = [];
        async.each(
            Object.keys(data.objectiveState),
            function(objectiveId, next){
                const objective = data.objectiveState[objectiveId];
                if(objective.owner && objective.owner.timestamp){
                    journal.push({
                        timestamp: objective.owner.timestamp,
                        id: objectiveId,
                        type: 'owner',
                        color: objective.owner.color
                    });
                }
                if(objective.guild && objective.guild.timestamp){
                    journal.push({
                        timestamp: objective.guild.timestamp,
                        id: objectiveId,
                        type: 'claimer',
                        guildId: objective.guild.id
                    });
                }

                next(null);
            },
            function(err){
                journal = _.sortBy(journal, function(entry){ return entry.timestamp; }).reverse()
                getJournalCallback(null, journal);
            }
        );
    }
};