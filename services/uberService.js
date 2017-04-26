var request = require('request');
var config = require(__dirname + '/../env').env;

var UBER_SERVICE_URL = config.uber_service.url;

var UberService = {
    listCabs: function(cab_options, callback) {
        var options = {
            method: 'GET',
            url: UBER_SERVICE_URL + '/api/cabs',
            qs: {
                latitude: '12.9162318',
                longitude: '77.6308856'
            },
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
    getCabData: function(cab_id, callback) {

    }
};

module.exports.UberService = UberService;
