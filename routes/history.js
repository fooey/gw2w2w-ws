"use strict"
const util = require('util');

const _ = require('lodash');
const async = require('async');

const cache = require('../lib/cache');

module.exports = function (req, res) {
	const matchId = req.params.matchId;

	cache.read({type: 'objectiveState', subType: matchId}, function(err, data){
		res.json(data);	
	});
};