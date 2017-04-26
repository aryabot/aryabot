// Service that Logs onto a system
// Cound be Mongo, File or Console or anything
// Right now it's only gonna be Mongo or console

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var mongoCredentials = require(__dirname + '/../env').env.mongo;

var url = 'mongodb://' + mongoCredentials.host + ':' + mongoCredentials.port + '/' + mongoCredentials.database;

var insertDocument = function(db, data, collection, callback) {
    db.collection(collection).insertOne(data, function(err, result) {
        assert.equal(err, null);
        console.log("Inserted into " + collection);
        callback(result);
    });
};

var Logger = {
    mongo: function(data, collection, callback) {
        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            insertDocument(db, data, collection, function() {
                db.close();
                if (callback) {
                    callback(err, {
                        status: 'ok'
                    });
                }
            });
        });
    },

    console: function(data) {
        console.log(data);
    }
};

module.exports.Logger = Logger;
