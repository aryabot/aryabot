var request = require('request');
var config = require(__dirname + '/../env').env;

var BOREKILL_SERVICE_URL = config.bore_kill_service.url;

var BoreKillService = {
    getComic: function(callback) {
        var options = {
            method: 'GET',
            url: BOREKILL_SERVICE_URL + '/api/comic',
            headers: {
                'content-type': 'application/json'
            }
        };

        request(options, function(error, response, body) {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, JSON.parse(body));
        });
    },
};

module.exports.BoreKillService = BoreKillService;
