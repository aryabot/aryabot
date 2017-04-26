var express = require('express');
var env = require(__dirname + '/env').env;
var Logger = require(__dirname + '/services/logger').Logger;

var app = express();

/**
 * Routes for the Application
 * The Routes will be simple.
 */
require('./bootstrap/routes')(app);

var server = app.listen(env.listen_port, function() {
    console.log('Aryabot AI listening on port ' + env.listen_port + '!');
});

// Universal Exception handling
process.on('uncaughtException', function(error) {
    server.close(function() {
        var logData = {
            error_message: error.message,
            error_stack: error.stack

        };
        console.log(error);
        Logger.mongo(logData, 'app_errors', function(err, status) {
            process.exit(1);
        });
    });
});
