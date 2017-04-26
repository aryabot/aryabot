// Require the Artificial Intelligence Module here
var wit = require('node-wit');
var fs = require('fs');
var request = require('request');

// Loading the config
var config = require(__dirname + '/../env').env;

var AI = {
    // Handle Text Inputs and get the User Intent
    text: function(text, callback) {
        wit.captureTextIntent(config.ai_access_key, text, callback);
    },

    // Handle Voice inputs from user,
    // parse the user message and get it as a text
    audio: function(file_full_path, callback) {
        var stream = fs.createReadStream(file_full_path);
        wit.captureSpeechIntent(config.ai_access_key, stream, 'audio/mpeg3', function(err, response) {
            console.log(response);
            fs.unlink(file_full_path);
            callback(err, response);
        });
    }
};

module.exports.AI = AI;
