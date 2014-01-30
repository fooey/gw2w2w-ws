
const emblem = require('../lib/emblem.js');

module.exports = function (req, res) {
	"use strict";
	const size = req.params.size;
	const guildId = req.params.guildId;


	require('../lib/guilds').getById(guildId, function(err, data){
		emblem.draw(data.emblem, size, '#ffffff', function(svg){
			res.header("Content-Type", "image/svg+xml");
			// res.send('<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' + svg);
			res.send(svg);
		})
	});

};