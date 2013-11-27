var anet = function () {
    var self = this;

    var request = require('request'),
        url = require('url')



    /*
    *
    *   PUBLIC PROPERTIES
    *
    */

    self.langs = [
        {key: 'en', label: 'EN', href: '/en', name: 'English'},
        {key: 'de', label: 'DE', href: '/de', name: 'Deutsch'},
        {key: 'fr', label: 'FR', href: '/fr', name: 'Français'},
        {key: 'es', label: 'ES', href: '/es', name: 'Español'},
    ];
    
    self.wvwColors = ['red', 'blue', 'green'];



    /*
    *
    *   PRIVATE PROPERTIES
    *
    */

    var api = {
        timeout: (10*1000),
        protocol: 'https',
        hostname: 'api.guildwars2.com',
        endPoints: {
            worldNames: '/v1/world_names.json',
            objectiveNames: '/v1/wvw/objective_names.json',
            matches: '/v1/wvw/matches.json',                    
            matchDetails: '/v1/wvw/match_details.json',         //?match_id=1-7
            guilds: '/v1/guild_details.json',                   //?guild_id=UUID
        }
    };



    /*
    *
    *   PUBLIC METHODS
    *
    */

    self.init = function(){
        return self;
    }



    self.getWorlds = function (lang, callback) {
        var apiUrl = getApiUrl('worldNames', { lang: lang });
        getRemote(apiUrl, callback)
    };



    self.getObjectives = function (lang, callback) {
        var apiUrl = getApiUrl('objectiveNames', { lang: lang });
        getRemote(apiUrl, callback)
    };



    self.getMatches = function (callback) {
        var apiUrl = getApiUrl('matches');
        getRemote(apiUrl, function(data){
            callback(data.wvw_matches)
        })
    };



    self.getMatchDetails = function (matchId, callback) {
        var apiUrl = getApiUrl('matchDetails', {match_id: matchId});
        getRemote(apiUrl, callback)
    };



    self.getGuild = function (guildId, callback) {
        var apiUrl = getApiUrl('guilds', {guild_id: guildId});
        getRemote(apiUrl, callback)
    };





    /*
    *
    *   PRIVATE METHODS
    *
    */

    var getRemote = function (requestUrl, callback) {
        request({
                url: requestUrl,
                timeout: api.timeout
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    callback(JSON.parse(body));
                }
                else {
                    console.log(error)
                }
            }
        );
    }



    var getApiUrl = function (endpoint, params) {
        return url.format({
            protocol: api.protocol
            , hostname: api.hostname
            , pathname: api.endPoints[endpoint]
            , query: params
        });
    };




    return self;
};




module.exports = new anet();