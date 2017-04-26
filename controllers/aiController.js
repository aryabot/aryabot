// Responder would send response back to client
var Responder = require(__dirname + '/../services/responder').Responder;
var Aryabot = require(__dirname + '/../libs/aryabot').Aryabot;
// Using the awesome underscore.js here
var _ = require('underscore');


// Global variables
var response = {
    status: 200,
    data: {},
    is_json: true
};

var AiController = {
    parseText: function(req, res) {
        if (!req.body.phone ||
            !req.body.message
        ) {
            response.status = 400;
            response.data = {
                message: 'bad request'
            };
            Responder.respond(res, response);
            return;
        }

        console.log(req.body);

        // If all inputs are correct, process the request
        Aryabot.handleTextInput(req.body, function(err, response_to_user) {
            console.log(response_to_user);
            if (response_to_user.type === 'image') {
                res.json({
                    type: 'image',
                    caption: response_to_user.caption,
                    url: response_to_user.image_url
                });
                res.end();
            } else {
                res.json({
                    type: 'text',
                    message: response_to_user
                });
                res.end();
            }
        });
    },

    parseAudio: function(req, res) {
        if (!req.body.phone ||
            !req.body.body.url
        ) {
            response.status = 400;
            response.data = {
                message: 'bad request'
            };
            Responder.respond(res, response);
            return;
        }

        // If everything seems OK, go ahead and call the AI
        Aryabot.handleVoiceInput(req.body, function(err, response_to_user) {
            res.json({
                type: 'text',
                message: response_to_user
            });
            res.end();
        });
    },

    parseContact: function(req, res) {
        if (!req.body.phone) {
            response.status = 400;
            response.data = {
                message: 'bad request'
            };
            Responder.respond(res, response);
            return;
        }

        Aryabot.handleContact(req.body, function(err, response_to_user) {
            res.json({
                type: 'text',
                message: response_to_user
            });
            res.end();
        });
    },

    parseLocation: function(req, res) {
        if (!req.body.phone) {
            response.status = 400;
            response.data = {
                message: 'bad request'
            };
            Responder.respond(res, response);
            return;
        }

        Aryabot.handleLocation(req.body, function(err, response_to_user) {
            res.json({
                type: 'text',
                message: response_to_user
            });
            res.end();
        });
    }
};

module.exports.AiController = AiController;
