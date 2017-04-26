// Service that sends response to the client
var Responder = {
    respond: function(res, options) { // res is the framework response object
        if (options.status) {
            res.status = options.status;
        } else {
            res.status = 200;
        }

        if (options.is_json) {
            res.json(options.data);
        } else {
            res.send(options.data);
        }

        res.end();
    }
};

module.exports.Responder = Responder;
