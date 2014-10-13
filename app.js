(function (module, express, path, serveFavicon, logger, cookieParser, bodyParser, mainRouter, chatRouter, lessMiddleware,
           debug, serveStatic) {
    var app = express(),
        debugHelper = debug('message-example'),
        server;

    app.use(serveFavicon(__dirname + '/public/favicon.ico'));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(lessMiddleware(path.join(__dirname, 'public')));
    app.use(serveStatic(path.join(__dirname, 'public')));
    app.use(serveStatic(path.join(__dirname, 'views')));

    app.use('/', mainRouter);
    app.use('/', chatRouter(
        { 
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        }
    ));

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500).send(err);
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500).send(err);
    });

    app.set('port', process.env.PORT || 8000);

    server = app.listen(app.get('port'), function () {
        debugHelper('Express server listening on port ' + server.address().port);
    });

    module.exports = {
        app: app,
        server: server
    };

}(module, require('express'), require('path'), require('serve-favicon'), require('morgan'), require('cookie-parser'),
  require('body-parser'), require('./routes/index'), require('./routes/chat'), require('less-middleware'),
  require('debug'), require('serve-static')));