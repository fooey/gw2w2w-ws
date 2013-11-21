module.exports = function (req, res) {
    var lang = req.params.lang;
    var worldNameSlug = req.params.worldName;

    var humanize = require('humanize');
    var _ = require('underscore');


    var waitForAppData = (function waitForAppData() {
        if (GLOBAL.GW2.ready) {

            var world = GLOBAL.dataHandler.getWorldBySlug(lang, worldNameSlug);
            var match = GLOBAL.dataHandler.getMatchByWorldId(world.id);
            var matchDetails = GLOBAL.dataHandler.getMatchDetails(match.wvw_match_id);
            var objectives = GLOBAL.dataHandler.getObjectives();

            var matchObjectives = {};
            _.each(_.flatten(_.pluck(matchDetails.maps, 'objectives')), function(matchObjective, ix){
                matchObjectives[matchObjective.id] = matchObjective;
            });

            var worlds = [];
            var mapNames = ['Eternal Battlegrounds'];
            _.each(['red','blue','green'], function(teamColor, i){
                var world = GLOBAL.dataHandler.getWorldById(lang, match[teamColor + '_world_id']);
                worlds.push(world);
                mapNames.push(world.name + ' Borderland');
            })

            res.render('tracker', {
                title: world.name + ' WvW Objectives Tracker'
                , lang: lang
                , humanize: humanize
                , world: world
                , match: match
                , objectives: objectives
                , matchDetails: matchDetails
                , matchObjectives: matchObjectives
                , dataHandler: GLOBAL.dataHandler
                , objectiveGroups: objectiveGroups
                , objectiveCommonNames: objectiveCommonNames
                , worlds: worlds
                , mapNames: mapNames
            });
        }
        else{
            setTimeout(waitForAppData, 100)
        }
    })();
};



var objectiveCommonNames = {
    'en': ",Overlook,Valley,Lowlands,Golanta Clearing,Pangloss Rise,Speldan Clearcut,Danelon Passage,Umberglade Woods,Stonemist Castle,Rogue's Quarry,Aldon's Ledge,Wildcreek Run,Jerrifer's Slough,Klovan Gully,Langor Gulch,Quentin Lake,Mendon's Gap,Anzalias Pass,Ogrewatch Cut,Veloka Slope,Durios Gulch,Bravost Escarpment,Garrison,Champion's Demense,Redbriar,Greenlake,Ascension Bay,Dawn's Eyrie,The Spiritholme,Woodhaven,Askalion Hills,Etheron Hills,Dreaming Bay,Victor's Lodge,Greenbriar,Bluelake,Garrison,Longview,The Godsword,Cliffside,Shadaran Hills,Redlake,Hero's Lodge,Dreadfall Bay,Bluebriar,Garrison,Sunnyhill,Faithleap,Bluevale Refuge,Bluewater Lowlands,Astralholme,Arah's Hope,Greenvale Refuge,Foghaven,Redwater Lowlands,The Titanpaw,Cragtop,Godslore,Redvale Refuge,Stargrove,Greenwater Lowlands,Temple of Lost Prayers,Battle's Hollow,Bauer's Estate,Orchard Overlook,Carver's Ascent,Carver's Ascent,Orchard Overlook,Bauer's Estate,Battle's Hollow,Temple of Lost Prayers,Carver's Ascent,Orchard Overlook,Bauer's Estate,Battle's Hollow,Temple of Lost Prayers".split(',')
    , 'fr': ",Belvédère,Vallée,Basses terres,Clairière de Golanta,Montée de Pangloss,Forêt rasée de Speldan,Passage Danelon,Bois d'Ombreclair,Château Brumepierre,Carrière des voleurs,Corniche d'Aldon,Piste du Ruisseau sauvage,Bourbier de Jerrifer,Petit ravin de Klovan,Ravin de Langor,Lac Quentin,Faille de Mendon,Col d'Anzalias,Percée de Gardogre,Flanc de Veloka,Ravin de Durios,Falaise de Bravost,Garnison,Fief du champion,Bruyerouge,Lac Vert,Baie de l'Ascension,Promontoire de l'aube,L'antre des esprits,Gentesylve,Collines d'Askalion,Collines d'Etheron,Baie des rêves,Pavillon du vainqueur,Vertebranche,Lac bleu,Garnison,Longuevue,L'Epée divine,Flanc de falaise,Collines de Shadaran,Rougelac,Pavillon du Héros,Baie du Noir déclin,Bruyazur,Garnison,Colline ensoleillée,Ferveur,Refuge de bleuval,Basses terres d'Eau-Azur,Astralholme,Espoir d'Arah,Refuge de Valvert,Havre gris,Basses terres de Rubicon,Bras du titan,Sommet de l'escarpement,Divination,Refuge de Valrouge,Bosquet stellaire,Basses terres d'Eau-Verdoyante,Temple des prières perdues,Vallon de bataille,Domaine de Bauer,Belvédère du Verger,Côte du couteau,Côte du couteau,Belvédère du Verger,Domaine de Bauer,Vallon de bataille,Temple des prières perdues,Côte du couteau,Belvédère du Verger,Domaine de Bauer,Vallon de bataille,Temple des prières perdues".split(',')
    , 'es': ",Mirador,Valle,Vega,Claro Golanta,Colina Pangloss,Claro Espeldia,Pasaje Danelon,Bosques Clarosombra,Castillo Piedraniebla,Cantera del Pícaro,Cornisa de Aldon,Pista Arroyosalvaje,Cenagal de Jerrifer,Barranco Klovan,Barranco Langor,Lago Quentin,Zanja de Mendon,Paso Anzalias,Tajo de la Guardia del Ogro,Pendiente Veloka,Barranco Durios,Escarpadura Bravost,Fuerte,Dominio del Campeón,Zarzarroja,Lagoverde,Bahía de la Ascensión,Aguilera del Alba,La Isleta Espiritual,Refugio Forestal,Colinas Askalion,Colinas Etheron,Bahía Onírica,Albergue del Vencedor,Zarzaverde,Lagoazul,Fuerte,Vistaluenga,La Hoja Divina,Despeñadero,Colinas Shadaran,Lagorrojo,Albergue del Héroe,Bahía Salto Aciago,Zarzazul,Fuerte,Colina Soleada,Salto de Fe,Refugio Valleazul,Tierras Bajas de Aguazul,Isleta Astral,Esperanza de Arah,Refugio de Valleverde,Refugio Neblinoso,Tierras Bajas de Aguarroja,La Garra del Titán,Cumbrepeñasco,Sabiduría de los Dioses,Refugio Vallerojo,Arboleda de las Estrellas,Tierras Bajas de Aguaverde,Templo de las Pelgarias,Hondonada de la Battalla,Hacienda de Bauer,Mirador del Huerto,Ascenso del Trinchador,Ascenso del Trinchador,Mirador del Huerto,Hacienda de Bauer,Hondonada de la Battalla,Templo de las Pelgarias,Ascenso del Trinchador,Mirador del Huerto,Hacienda de Bauer,Hondonada de la Battalla,Templo de las Pelgarias".split(',')
    , 'de': ",Aussichtspunkt,Tal,Tiefland,Golanta-Lichtung,Pangloss-Anhöhe,Speldan Kahlschlag,Danelon-Passage,Umberlichtung-Forst,Schloss Steinnebel,Schurkenbruch,Aldons Vorsprung,Wildbachstrecke,Jerrifers Sumpfloch,Klovan-Senke,Langor - Schlucht,Quentinsee,Mendons Spalt,Anzalias-Pass,Ogerwacht-Kanal,Veloka-Hang,Durios-Schlucht,Bravost-Abhang,Festung,Landgut des Champions,Rotdornstrauch,Grünsee,Bucht des Aufstiegs,Horst der Morgendammerung,Der Geisterholm,Wald - Freistatt,Askalion - Hügel,Etheron - Hügel,Traumbucht,Sieger - Hütte,Grünstrauch,Blausee,Festung,Weitsicht,Das Gottschwert,Felswand,Shadaran Hügel,Rotsee,Hütte des Helden,Schreckensfall - Bucht,Blaudornstrauch,Festung,Sonnenlichthügel,Glaubenssprung,Blautal - Zuflucht,Blauwasser - Tiefland,Astralholm,Arahs Hoffnung,Grüntal - Zuflucht,Nebel - Freistatt,Rotwasser - Tiefland,Die Titanenpranke,Felsenspitze,Götterkunde,Rottal - Zuflucht,Sternenhain,Grünwasser - Tiefland,Tempel der Verlorenen Gebete,Schlachten-Senke,Bauers Anwesen,Obstgarten Aussichtspunkt,Aufstieg des Schnitzers,Aufstieg des Schnitzers,Obstgarten Aussichtspunkt,Bauers Anwesen,Schlachten-Senke,Tempel der Verlorenen Gebete,Aufstieg des Schnitzers,Obstgarten Aussichtspunkt,Bauers Anwesen,Schlachten-Senke,Tempel der Verlorenen Gebete".split(',')
};




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