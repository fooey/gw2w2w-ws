"use strict"
const util = require('util');

const _ = require('lodash');
const async = require('async');

const history = require('../lib/history');

module.exports = function (req, res) {
    const matchId = req.params.matchId;
    const ext = req.params.ext || 'json';
    const qry = (matchId) ? {matchId: matchId} : {};

    history.get(qry, function(err, docs){
        async.each(docs, function(doc, next){
            delete doc._id;
            next(null)
        }, function(err, results){
            //docs = _.sortBy(docs, function(doc){return doc.timestamp}).reverse()
            if(ext === 'json'){
                res.json(docs);
            }
            else{
                let html = [''];
                _.each(docs, function(doc){
                    html.push(['', doc.timestamp, doc.eventType, doc.matchId, doc.objectiveId, (doc.owner || doc.guildId)].join('<td>'));
                })
                res.send('<style>td{padding: 0 .5em;}</style><table cellpadding=0 cellspacing=0>' + html.join('<tr>') + '</table>');
            }
        })
        
    });
};