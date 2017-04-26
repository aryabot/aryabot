// Load dependencies for route handling
var express = require('express');
var bodyParser = require('body-parser');

// Load the logger because logging is important for obvious reasons!
var Logger = require(__dirname + '/../services/logger').Logger;

// Load the Controllers because MVC architecture is cool
var InitController = require(__dirname + '/../controllers/initController').InitController;
var AiController = require(__dirname + '/../controllers/aiController').AiController;

module.exports = function(app) {
    var aiRouter = express();
    var cronRouter = express();

    /************************************
     *            MIDDLEWARES           *
     ***********************************/
    // Body parser converts JSON and Form data to object
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    // Custom Middleware to log all request
    app.use('/*', logRequest);


    /*************************************
     *              ROUTES               *
     ************************************/

    app.get('/', function(req, res) {
        res.json({
            service: 'AI',
            health: 'Running'
        });
        res.end();
    });
    // This would have all the routes starting with /api
    // /api would be the core, will be authenticated and should never
    // go down! ever!
    app.use('/api', aiRouter);
    aiRouter.get('/', function(req, res) {
        res.status = 401;
        res.json({
            status: 'ERROR',
            message: 'Not allowed to use this route'
        });
        res.end();
    });

    aiRouter.get('/health', InitController.getHealth);

    aiRouter.post('/text', AiController.parseText);
    aiRouter.post('/audio', AiController.parseAudio);
    aiRouter.post('/contact', AiController.parseContact);
    aiRouter.post('/location', AiController.parseLocation);

    // This would contain all the routes srarting with /cron
    // /cron would handle updating redis cache and things like that
    app.use('/cron', cronRouter);
};

var logRequest = function(req, res, next) {
    var logData = {
        url: req.originalUrl,
        time: new Date(),
        parameters: req.params,
        body: req.body,
        query_parameters: req.query
    };
    Logger.mongo(logData, 'request_log');
    next();
};
