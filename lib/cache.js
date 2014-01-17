"use strict"

const fs = require ('fs');
const path = require('path');

const async = require('async');
const _ = require('lodash');



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
	guilds: {
		fileName: "guild" 
	},
};



/*
*
*   PSUEDO INIT
*
*/




/*
*
*   PUBLIC METHODS
*
*/

Controller.init = function(onInitDone){
	fs.mkdir(Controller.getCacheFolder(), function(){
		Controller.deleteCacheFiles('tmp', onInitDone);
	});
};



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

	const tmpPath = getTempFile();
	
	// race condition dodging
	fs.writeFile(tmpPath, toDisk, function(err){
		//if(err){console.log('ERR:Cache.write', cacheType, err)}
		fs.rename(tmpPath, cachePath, function(err){
			if(err){
				//console.log('ERR:Cache.write:rename', cacheType, err);
				fs.unlink(tmpPath, function(err){
					setTimeout(function(){
						console.log('RETRYING CACHE WRITE', cacheType);
						Controller.write(cacheType, content, onWriteDone);
					}, 100);
				});
				
			}
			else{
				onWriteDone(err)
			}
		});
	});
};



Controller.read = function(cacheType, onReadDone){
	const cachePath = Controller.getFilePath(cacheType);

	fs.readFile(cachePath, function(err, data){
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



Controller.deleteCacheFiles = function(extensionToDelete, callback){
	fs.readdir(Controller.getCacheFolder(), function(err, files){
        async.each(
            files,
            function(fileName, nextFile){
                const splitFile = fileName.split('.');
                if(splitFile[splitFile.length-1] === extensionToDelete){
                    fs.unlink(path.join(cacheFolder, fileName), nextFile);
                }
                else{
                    nextFile()
                }
            },callback
        );
	});
};



function getTempFile(){
	return path.join(
		Controller.getCacheFolder(),
		require('uuid').v1() + '.tmp'
	);
}