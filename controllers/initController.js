// Responder would send response back to client
var Responder = require(__dirname + '/../services/responder').Responder;

// Using the awesome underscore.js here
var _ = require('underscore');

var Redis = require(__dirname + '/../models/redis').Redis;

// Global variables
var response = {
    status: 200,
    data: {},
    is_json: true
};

var InitController = {
    initUserAccessTokens: function(req, res) {
        // Read from MySQL or Cassandra, the keys for the user captured
        // in the website and write to redis
        // In redis, the key would be "phone_number-tokens"
        // Value would be JSON_encoded value of the keys array
    },
    test: function(req, res) {
        Redis.get('8762804962', function(data) {
            res.json(JSON.parse(data));
            res.end();
        });
    },
    getHealth: function(req, res) {
        Redis.get('health', function(data) {
            res.json({
                status: data
            });
            res.end();
            return;
        });
    }
};

module.exports.InitController = InitController;
