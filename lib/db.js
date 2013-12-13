
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const mongoUrl = process.env.MONGOHQ_URL || "mongodb://localhost:27017/gw2w2w"


module.exports= {
	url: mongoUrl,
	client: MongoClient,
};