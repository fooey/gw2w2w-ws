const
	path = require('path');

const
	_ = require('lodash');

const
	langs = require(path.join(process.cwd(), 'lib/anet')).getLangs();


module.exports = function (req, res) {

	// should reload from a resync broadcast, but this is a failsafe to force a reload after 20 seconds or so
    res.setHeader('Refresh', _.random(20,40));

    res.render('loading', {
        title: 'Loading: GW2 WvW Objectives Tracker',
        langs: langs
    });

};