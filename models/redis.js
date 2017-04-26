var redis = require('redis');
var Logger = require(__dirname + '/../services/logger').Logger;

var handleErrors = function(client) {
    client.on('error', function(err) {
        var logData = {
            error: err,
            time: new Date()
        };
        Logger.mongo(logData, 'redis_errors');
    });
};

var Redis = {
    get: function(key, callback) {
        client = redis.createClient();
        handleErrors(client);
        client.get(key, function(err, result) {
            client.quit();
            if (err) {
                callback(null);
            } else {
                callback(result);
            }
        });
    },
    set: function(key, value, callback) {
        client = redis.createClient();
        handleErrors(client);
        client.set(key, value, function(err, result) {
            client.quit();

            // callback may not always e required
            if (callback) {
                if (err) {
                    callback(null);
                } else {
                    callback(result);
                }
            }
        });
    }
};

module.exports.Redis = Redis;
