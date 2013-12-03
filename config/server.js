module.exports = function (app, express) {
    var config = this;

    var path = require('path')

    app.configure(function () {
        app.set('port', process.env.PORT || 3000);
        app.set('views', path.join(GLOBAL.appRoot,'views'));
        app.set('view engine', 'jade');
        //app.set('view cache', false);
        app.use(express.favicon(path.join(GLOBAL.appRoot, 'public/images/gw2-dragon-32.png')));
        app.use(express.logger('dev'));
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(app.router);
        app.use(express.static(path.join(GLOBAL.appRoot, 'public')));
    });


    app.configure('production', function () {
        if(process.env.NODETIME_ACCOUNT_KEY) {
            require('nodetime').profile({
                accountKey: process.env.NODETIME_ACCOUNT_KEY,
                appName: 'gw2w2w-ws' // optional
            });
        }

    });


    app.configure('development', function () {
        app.use(express.errorHandler());
        app.locals.pretty = true;
    });




    return config;
};