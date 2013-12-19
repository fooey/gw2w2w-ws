"use strict"


module.exports = function(app, express){
    var routes = this;

    app.get('/stylesheets/style.min.css', require('./style.js'));
    

    app.get('/:lang([a-z]{2})?', require('./overview.js'));
    app.get('/:lang([a-z]{2})/:worldName', require('./tracker.js'));


    app.get('/journal/:matchId?.:ext?', require('./history.js'));



    app.get('/resetMatches', function(req, res){
		require('../lib/matches').resetMatches(function(){
			res.send('done')
		});
    });

    app.get('/resetAll', function(req, res){
		require('../lib/db').dropDatabase(function(){
			res.send('done')
		});
    });

    return routes;
};