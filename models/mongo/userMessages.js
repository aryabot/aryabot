// Model that would read / record user messages

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var mongoCredentials = require(__dirname + '/../../env').env.mongo;

var url = 'mongodb://' + mongoCredentials.host + ':' + mongoCredentials.port + '/' + mongoCredentials.database;

var getLastInsertedUserMessage = function(db, phone, callback) {

    db.collection('user_messages').find({
        user_phone: phone
    }).sort({
        _id: -1
    }).limit(1).toArray(function(err, data) {
        assert.equal(null, err);
        if (data[0]) {
            callback(null, data[0]);
        } else {
            callback(null, null);
        }
    });

};

var UserMessages = {

    getLastMessage: function(phone, callback) {
        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            getLastInsertedUserMessage(db, phone, function(err, data) {
                db.close();
                assert.equal(null, err);
                callback(null, data);
            });
        });
    }
};

module.exports.UserMessages = UserMessages;
