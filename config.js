module.exports = function (app, express) {
    var config = this;

    var path = require('path')

    GLOBAL.appRoot = __dirname;

    app.configure(function () {
        app.set('port', process.env.PORT || 3000);
        app.set('views', __dirname + '/views');
        app.set('view engine', 'jade');
        app.set('view cache', false);
        app.use(express.favicon(path.join(__dirname, 'public/images/gw2-dragon-32.png')));
        app.use(express.logger('dev'));
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(app.router);
        app.use(express.static(path.join(__dirname, 'public')));
    });


    app.configure('development', function () {
        app.use(express.errorHandler());
        app.locals.pretty = true;
    });




    return config;
};