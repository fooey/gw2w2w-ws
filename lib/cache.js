"use strict"

const fs = require ('fs');
const path = require('path');

const lockFile = require('lockfile')



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

		//console.log(cacheType, 'isFresh', bool)
		if(bool){
			onFresh();
		}
		else{
			onNotFresh();
		}
	});
};



Controller.write = function(cacheType, content, onWriteDone){
	const cachePath = Controller.getFilePath(cacheType);
	const toDisk = JSON.stringify(content);

	// if(cacheType === 'objectiveOwners') console.log('Write cache:', cachePath, toDisk)

	// lockFile.lock(cachePath, {}, function (err) {
	// 	console.log('LOCK', cachePath)

		fs.writeFile(cachePath, toDisk, function(err){
			// lockFile.unlock(cachePath, function(err){
				// console.log('UN-LOCK', cachePath)
				onWriteDone(err)
			// });
		});

	// });
};



Controller.read = function(cacheType, onReadDone){
	const cachePath = Controller.getFilePath(cacheType);
	// console.log('Read cache:', cachePath)

	// lockFile.lock(cachePath, {}, function (err) {
	// 	console.log('LOCK', cachePath)

		fs.readFile(Controller.getFilePath(cacheType), function(err, data){
			//if(err){console.log(err)};

			// lockFile.unlock(cachePath, function(err){
			// 	console.log('UN-LOCK', cachePath)
				if(data){
					try{
						data = JSON.parse(data.toString());
					}
					catch(excpt){
						throw(cachePath)
					}
				}

				onReadDone(err, data);
			// });
		});
	// });


};
