"use strict"

const _ = require('lodash');

const langs = require('../lib/anet').langs;


module.exports = function (req, res) {
    const urlLang = req.params.lang || 'en';
    const renderStart = Date.now();

	// should reload from a resync broadcast, but this is a failsafe to force a reload after 20 seconds or so
    res.setHeader('Refresh', _.random(20,40));

    res.render('loading', {
        title: 'Loading: GW2 WvW Objectives Tracker',
        langs: langs,
        urlLang: urlLang,
        renderStart: renderStart,
    });

};