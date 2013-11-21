module.exports = function(app, express){
    var routes = this;

    app.get('/stylesheets/style.min.css', require('./style.js'));

    app.get('/:lang([a-z]{2})?', require('./overview.js'));
    app.get('/:lang([a-z]{2})/:worldName', require('./tracker.js'));

    return routes;
};