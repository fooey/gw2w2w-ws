module.exports = function (app, express) {
    var config = this;

    var path = require('path')


    app.configure('production', function () {
        app.use(express.logger('short'));
        app.set('view cache', true);
    });


    app.configure('development', function () {
        app.use(express.logger('dev'));
        app.use(express.errorHandler());
        app.set('view cache', false);
        app.locals.pretty = true;
    });

    app.configure(function () {
        app.set('port', process.env.PORT || 3000);
        app.set('views', path.join(GLOBAL.appRoot,'views'));
        app.set('view engine', 'jade');
        app.use(express.favicon(path.join(GLOBAL.appRoot, 'public/images/gw2-dragon-32.png')));
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(app.router);
        app.use(express.static(path.join(GLOBAL.appRoot, 'public')));
    });




    return config;
};