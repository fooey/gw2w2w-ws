module.exports = function (app, express) {
    var config = this;

    var path = require('path')



    app.configure(function () {
        app.set('port', process.env.PORT || 3000);

        app.set('views', path.join(process.cwd(),'views'));
        app.set('view engine', 'jade');
        app.set('view cache', true);

        app.use(express.favicon(path.join(process.cwd(), 'public/images/gw2-dragon-32.png')));
        app.use(express.urlencoded());
        app.use(express.methodOverride());
        app.use(app.router);
        app.use(express.static(path.join(process.cwd(), 'public')));

        app.use(express.logger('dev'));
    });

    app.configure('development', function(){
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
        app.locals.pretty = true;
    });

    app.configure('production', function(){
        app.use(express.errorHandler());
    });




    return config;
};