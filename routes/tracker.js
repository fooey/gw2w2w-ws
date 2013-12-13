const
    path = require('path');

/*
const
    _ = require('lodash'),
    async = require('async');
*/

const worldsController = require(path.join(process.cwd(), 'lib/worlds'));
const objectivesController = require(path.join(process.cwd(), 'lib/objectives'));
const matchesController = require(path.join(process.cwd(), 'lib/matches'));
const matchDetailsController = require(path.join(process.cwd(), 'lib/matchDetails'));

const
    langs = require(path.join(process.cwd(), 'lib/anet')).getLangs();
    


module.exports = function (req, res) {
    const lang = req.params.lang;
    const slug = req.params.worldName;

    if(!GLOBAL.dataReady){
        require('./loading')(req, res);
    }
    else{
        const world = worldsController.getWorldBySlug(lang, slug);
        const match = matchesController.getMatchByWorldId(lang, world.getId());
        const objectives = objectivesController.getAll();

        const matchDetails = matchDetailsController.getMatchDetails(match.getId());
        const matchObjectives = matchDetails.getObjectives();
        const scores = matchDetails.getScores();
        const mapNames = matchDetails.getMapNames(lang);

        const title = (world.getName() + ' WvW Objectives Tracker');


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

    }
};


const
    neutralGroupClass = 'alert alert-warning',
    ruinsGroupClass = 'well',
    redGroupClass = 'alert alert-danger',
    blueGroupClass = 'alert alert-info',
    greenGroupClass = 'alert alert-success';

const objectiveGroups = {
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