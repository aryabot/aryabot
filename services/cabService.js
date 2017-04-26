// load the Async Module
var async = require('async');

var UberService = require(__dirname + '/uberService').UberService;

var CabService = {
    getCabs: function(options, callback) {
        async.parallel({
            uber: function(callback) {
                UberService.listCabs(options, function(err, data) {
                    if(err) {
                        callback(err, null);
                        return;
                    }
                    callback(null, data.times);
                });
            }
        }, function (err, result) {
            callback(err, result);
        });
    }
};

module.exports.CabService = CabService;
