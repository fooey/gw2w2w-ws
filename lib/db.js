"use strict";

const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const mongoUrl = process.env.MONGOHQ_URL || "mongodb://localhost:27017/gw2w2w"

let DB = {
	url: mongoUrl,
	client: MongoClient
};


DB.connect = function(callback){
	DB.client.connect(DB.url, callback)//(err, db)
};


DB.dropDatabase = function(callback){
	DB.connect(function(err, db){
		db.dropDatabase(function(){
			console.log('********************')
			console.log('  DROPPED DATABASE  ')
			console.log('********************')
			db.close(function(){
				callback();
			});
		});
	})
};


DB.getCollection = function(collectionName, callback){
	DB.connect(function(err, db){
        if(err){console.log('ERROR IN DB.connect()', err)}

		db.collection(collectionName, function(err, collection){
            if(err){console.log('ERROR IN DB.getCollection()', err)}

            callback(err, db, collection);
        });
	})
};



module.exports = DB;