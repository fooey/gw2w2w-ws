"use strict"

const url = require('url');

const request = require('request');


/*
*
*   DEFINE EXPORT
*/

var Anet = {
    langs: [
        {key: 'en', label: 'EN', href: '/en', name: 'English'},
        {key: 'de', label: 'DE', href: '/de', name: 'Deutsch'},
        {key: 'fr', label: 'FR', href: '/fr', name: 'Français'},
        {key: 'es', label: 'ES', href: '/es', name: 'Español'},
    ],
    wvwColors: ['red', 'blue', 'green'],
};

module.exports = Anet;


/*
*
*   PRIVATE PROPERTIES
*
*/

const __INSTANCE = {
    api: {
        timeout: (10*1000),
        protocol: 'https',
        hostname: 'api.guildwars2.com',
        endPoints: {
            worldNames: '/v1/world_names.json',
            objectiveNames: '/v1/wvw/objective_names.json',
            matches: '/v1/wvw/matches.json',
            matchDetails: '/v1/wvw/match_details.json',      //?match_id=1-7
            guilds: '/v1/guild_details.json',                //?guild_id=UUID
        },
    },
};



/*
*
*   PUBLIC METHODS
*
*/

Anet.getWorlds = function (lang, callback) {
    const apiUrl = __getApiUrl('worldNames', { lang: lang });
    __getRemote(apiUrl, callback)
};



Anet.getObjectives = function (lang, callback) {
    const apiUrl = __getApiUrl('objectiveNames', { lang: lang });
    __getRemote(apiUrl, callback)
};



Anet.getMatches = function (callback) {
    const apiUrl = __getApiUrl('matches');
    __getRemote(apiUrl, function(err, data){
        const wvw_matches = (data && data.wvw_matches) ? data.wvw_matches : [];
        callback(err, wvw_matches)
    })
};



Anet.getMatchDetails = function (matchId, callback) {
    const apiUrl = __getApiUrl('matchDetails', {match_id: matchId});
    __getRemote(apiUrl, callback)
};



Anet.getGuild = function (guildId, callback) {
    const apiUrl = __getApiUrl('guilds', {guild_id: guildId});
    __getRemote(apiUrl, callback)
};






/*
*
*   PRIVATE METHODS
*
*/

const __getRemote = function (requestUrl, callback) {
    const startTime = Date.now();
    //console.log(Date.now(), requestUrl)
    request({
            url: requestUrl,
            timeout: __INSTANCE.api.timeout
        },
        function (err, response, body) {
            //console.log(Date.now(), requestUrl, Date.now() - startTime, 'elapsed')
            if (response && response.statusCode == 200) {
                callback(err, JSON.parse(body));
            }
            else{
                callback(err, {});
            }
        }
    );
}



const __getApiUrl = function (endpoint, params) {
    return url.format({
        protocol: __INSTANCE.api.protocol
        , hostname: __INSTANCE.api.hostname
        , pathname: __INSTANCE.api.endPoints[endpoint]
        , query: params
    });
};