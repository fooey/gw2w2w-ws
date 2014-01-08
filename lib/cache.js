"use strict"

const fs = require ('fs');
const path = require('path');



/*
*
*   DEFINE EXPORT
*
*/

let Controller = {};
module.exports = Controller;




/*
*
*   PRIVATE PROPERTIES
*
*/

const cacheFolder = path.join(process.cwd(), 'cache');

const cacheTypes = {
	matches: {
		maxAge: 1000 * 60 * 60,
		fileName: "matches" 
	},
	objectives: {
		maxAge: 1000 * 60 * 60,
		fileName: "objectives" 
	},
	worlds: {
		maxAge: 1000 * 60 * 60,
		fileName: "worlds" 
	},
	matchDetails: {
		maxAge: 1000 * 3,
		fileName: "matchDetails" 
	},
	matchDetailsPREV: {
		fileName: "matchDetailsPREV" },
	scores: {
		fileName: "scores" 
	},
	objectiveState: {
		fileName: "objectiveState" 
	},
};




/*
*
*   PUBLIC METHODS
*
*/

Controller.getCacheFolder = function(){
	return cacheFolder;
};

Controller.getFilePath = function(cacheType){
	const filename = (typeof(cacheType) === 'string')
		? cacheTypes[cacheType].fileName
		: [
			cacheTypes[cacheType.type].fileName,
			cacheType.subType
		].join('-');

	return path.join(cacheFolder, filename + '.json');
};



Controller.isLocalFresh = function(cacheType, onFresh, onNotFresh){
	let bool = false;
	fs.stat(Controller.getFilePath(cacheType), function(err, stats){
		if(err){console.log(err)}

		if(stats){
			const localAge = Date.now() - stats.mtime;
			bool = !!(localAge <= cacheTypes[cacheType].maxAge);
		}

		if(bool || !onNotFresh){
			onFresh(bool);
		}
		else{
			onNotFresh(bool);
		}
	});
};



Controller.write = function(cacheType, content, onWriteDone){
	const cachePath = Controller.getFilePath(cacheType);
	const toDisk = JSON.stringify(content);

	fs.writeFile(cachePath, toDisk, onWriteDone);
};



Controller.read = function(cacheType, onReadDone){
	const cachePath = Controller.getFilePath(cacheType);

	fs.readFile(Controller.getFilePath(cacheType), function(err, data){
		if(data){
			data = data.toString();

			try{
				data = JSON.parse(data);
			}
			catch(excpt){}
		}

		onReadDone(err, data);
	});
};
