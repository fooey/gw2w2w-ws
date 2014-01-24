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

const __INSTANCE = {
	cacheFolder: path.join(process.cwd(), 'cache'),

	cacheTypes: {
		matches: {
			maxAge: 1000 * 60 * 60 * 1,
			fileName: "matches", 
		},
		objectives: {
			maxAge: 1000 * 60 * 60 * 1,
			fileName: "objectives",
		},
		worlds: {
			maxAge: 1000 * 60 * 60 * 1,
			fileName: "worlds",
		},
		matchDetails: {
			maxAge: 1000 * 3,
			fileName: "matchDetails" ,
		},
		matchDetailsPREV: {
			fileName: "matchDetailsPREV" },
		scores: {
			fileName: "scores",
		},
		objectiveState: {
			fileName: "objectiveState" ,
		},
		guilds: {
			maxAge: 1000 * 60 * 60 * 1,
			fileName: "guilds/guild",
		},
	}
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
		fs.mkdir(path.join(Controller.getCacheFolder(), 'guilds'), function(){
			Controller.deleteCacheFiles('tmp', onInitDone);
		});
	});
};



Controller.getCacheFolder = function(){
	return __INSTANCE.cacheFolder;
};



Controller.isLocalFresh = function(cacheType, onFresh, onNotFresh){
	const thisCacheType = getCacheType(cacheType);
	let bool = false;
	fs.stat(thisCacheType.filePath, function(err, stats){
		// if(err){console.log(err)}

		if(stats){
			const localAge = Date.now() - stats.mtime;
			// console.log(cacheType, thisCacheType)
			bool = !!(localAge <= thisCacheType.maxAge);
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
	const thisCacheType = getCacheType(cacheType);
	const cachePath = thisCacheType.filePath;
	const toDisk = JSON.stringify(content);

	const tmpPath = getTempFile();


	// console.log('write()', cacheType)
	// console.log('write()', cachePath)
	// throw('derp')
	
	// race condition dodging
	fs.writeFile(tmpPath, toDisk, function(err){
		//if(err){console.log('ERR:Cache.write', cacheType, err)}
		fs.rename(tmpPath, cachePath, function(err){
			if(err){
				//console.log('ERR:Cache.write:rename', cacheType, err);
				fs.unlink(tmpPath, function(err){
					setTimeout(function(){
						console.log('RETRYING CACHE WRITE', cacheType, cachePath);
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
	const thisCacheType = getCacheType(cacheType);
	const cachePath = thisCacheType.filePath;

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
                    fs.unlink(path.join(Controller.getCacheFolder(), fileName), nextFile);
                }
                else{
                    nextFile()
                }
            },callback
        );
	});
};




/*
*
*   PRIVATE METHODS
*
*/

function getCacheType(cacheType){
	let thisCacheType;
	let thisFileName;
	if (typeof(cacheType) === 'string'){
		thisCacheType = __INSTANCE.cacheTypes[cacheType];
		thisFileName = thisCacheType.fileName + '.json';
	}
	else{
		thisCacheType = __INSTANCE.cacheTypes[cacheType.type];
		thisCacheType.subType = cacheType.subType;
		thisFileName = thisCacheType.fileName + '-' + cacheType.subType + '.json';
	}
	thisCacheType.filePath = path.join(Controller.getCacheFolder(), thisFileName);

	// console.log('getCacheType()', cacheType, thisCacheType)
	return thisCacheType;
}


function getTempFile(){
	return path.join(
		Controller.getCacheFolder(),
		require('uuid').v1() + '.tmp'
	);
}