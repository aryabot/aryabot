var urban = require('urban');
var Logger = require(__dirname + '/logger').Logger;

var DictionaryService = {

    getDefinition : function (word, callback) {
        urban_api = urban(word);

        urban_api.first(function(definition) {
            var logData = {
                word: word,
                definition: definition
            };
            Logger.mongo(logData, 'dictionary_log');
            console.log(definition);
            callback(definition.definition);
        });
    }
};

module.exports.DictionaryService = DictionaryService;
