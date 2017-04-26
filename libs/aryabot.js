// AI communicates with https://wit.ai
var AI = require(__dirname + '/../services/ai').AI;

// Load the responses to be sent to the user
var responses_to_user = require(__dirname + '/../bootstrap/responses.json');
var Logger = require(__dirname + '/../services/logger').Logger;

var TemplateRender = require(__dirname + '/../helpers/templateRender').TemplateRender;

// Load all other Services
var Services = require(__dirname + '/../services');
var CabService = require(__dirname + '/../services/cabService').CabService;
var DictionaryService = require(__dirname + '/../services/dictionaryService').DictionaryService;
var BoreKillService = require(__dirname + '/../services/boreKillService').BoreKillService;

var UserMessages = require(__dirname + '/../models/mongo/userMessages').UserMessages;
var Redis = require(__dirname + '/../models/redis').Redis;

var _ = require('underscore');
var moment = require('moment');
var shell = require('child_process');

var TIME_OUT_MINUTES = 25;

var logRequestResponse = function(request, format, response) {
    var logData = {
        request: request,
        format: format,
        time: new Date(),
        response: response
    };
    Logger.mongo(logData, 'wit_ai_log');
};

var logUserMessageWithIntent = function(user_phone, intent, response) {
    var logData = {
        user_phone: user_phone,
        intent: intent,
        time: new Date(),
        aryabot_response: response
    };
    Logger.mongo(logData, 'user_messages');
    Redis.set(user_phone + '_last_message', JSON.stringify(logData));
};

var getLastMessage = function(user_phone, callback) {
    Redis.get(user_phone + '_last_message', function(err, result) {
        if (result) {
            callback(err, JSON.parse(result));
            return;
        } else {
            UserMessages.getLastMessage(user_phone, callback);
        }
    });
};

var processCabResponse = function(cab_response) {
    var response = '';
    console.log(cab_response);

    for (var i = 0; i < cab_response.uber.length; i++) {
        var car = cab_response.uber[i];
        var data = {
            cab_name: car.display_name,
            time: car.estimate
        };

        var template = _.sample(responses_to_user.single_cab);
        response += TemplateRender.render(template, data) + ',\n';
    }

    if (cab_response.length == 1) {
        response += _.sample(responses_to_user.just_one_cab_available);
    } else {
        response += _.sample(responses_to_user.multiple_cabs_available);
    }
    return response;
};

var processUserIntent = function(user_phone, response, callback) {
    var intent = response.outcomes[0].intent;
    switch (intent) {
        case 'greeting':
            getLastMessage(user_phone, function(err, data) {
                if (err) {
                    callback(null, _.sample(responses_to_user.feeling_dumb));
                    return;
                }

                if (data === null) {
                    callback(null, _.sample(responses_to_user.first_timer));
                    return;
                }

                var diff = moment.duration(moment().diff(data.time));
                if (diff.minutes() > TIME_OUT_MINUTES) {
                    Services.initAll();
                    callback(null, _.sample(responses_to_user.greeting_again));
                    return;
                }
                Services.initAll();
                callback(null, _.sample(responses_to_user[intent]));
            });
            break;

        case 'location':
            getLastMessage(user_phone, function(err, data) {
                if (data.intent === 'book_cab' || data.intent === 'get_cab') {
                    CabService.getCabs(null, function(err, response) {
                        if (err) {
                            callback(err, null);
                            return;
                        }
                        formatted_response = processCabResponse(response);
                        callback(null, formatted_response);
                    });
                } else {
                    callback(null, _.sample(responses_to_user.feeling_dumb));
                }
            });
            break;

        case 'get_cab':
            getLastMessage(user_phone, function(err, data) {
                callback(null, _.sample(responses_to_user[intent]));
            });
            break;

        case 'farewell':
            callback(null, _.sample(responses_to_user[intent]));
            break;

        case 'bored':
            BoreKillService.getComic(function (err, response) {
                if (err) {
                    callback(null, _.sample(responses_to_user.bore_kill));
                    return ;
                } else {
                    response_to_user = {
                        type: 'image',
                        image_url: response.image,
                        caption: ''
                    };
                    if(response.title) {
                        response_to_user.caption = response_to_user.caption + response.title;
                    }
                    if (response.author) {
                        response_to_user.caption = response_to_user.caption +
                            ' - By '+ response.author +
                            ' Of ' + response.channel;
                    } else {
                        response_to_user.caption = response_to_user.caption + ' - By ' + response.channel;
                    }
                    callback(null, response_to_user);
                }
            });
            break;

        case 'define':
            var word = null;
            if (response.outcomes[0].entities.word) {
                word = response.outcomes[0].entities.word[0].value;
            } else if (response.outcomes[0].entities.words) {
                word = response.outcomes[0].entities.words[0].value;
            }
            word = word.replace('\?*', '');
            DictionaryService.getDefinition(word, function(definition) {
                callback(null, word.toUpperCase() + ' : ' + definition);
            });
            break;
        default:
            callback(null, _.sample(responses_to_user.feeling_dumb));
    }
};

var Aryabot = {
    phone: null,

    handleTextInput: function(input, callback) {
        _this = this;
        _this.phone = input.phone;
        _this.callback = callback;

        AI.text(input.message, function(err, response) {
            console.log(response);
            logRequestResponse(input.message, 'text', response);
            if (response.outcomes.length === 0) {
                _this.callback(err, _.sample(responses_to_user.feeling_dumb));
                return;
            }
            var user_intent = response.outcomes[0].intent;

            processUserIntent(_this.phone, response, function(err, response) {
                logUserMessageWithIntent(_this.phone, user_intent, response);
                _this.callback(err, response);
            });
        });
    },

    handleVoiceInput: function(input, callback) {
        _this = this;
        _this.phone = input.phone;
        _this.callback = callback;

        var filename = new Date().getTime() + '.mp3';
        var file_path_mp3 = __dirname + '/../storage/' + filename;
        var file_path_download = __dirname + '/../storage/' + input.body.file;

        // Download the Audio File From WhatsApp Server
        var command = 'wget ' + input.body.url + ' -O ' + file_path_download;

        // Convert to mp3 because we would need a central file format
        var command_2 = 'ffmpeg -i ' + file_path_download + ' ' + file_path_mp3;

        // Remove the original downloaded file
        var command_3 = 'rm ' + file_path_download;

        // Welcome to the callback hell *insert evil laugh here* "Muhahahaha"!!
        shell.exec(command, function(err, err2, data) {
            if (err) {
                console.log('ERROR!!', err);
                callback(err, null);
                return;
            }

            shell.exec(command_2, function(err, err2, data) {
                shell.exec(command_3, function(err, data) {
                    console.log('removed file ', input.body.file);
                }); // We don't have to wait for the file to get deleted

                AI.audio(file_path_mp3, function(err, response) {
                    logRequestResponse(input, 'audio', response);
                    var user_intent = response.outcomes[0].intent;

                    processUserIntent(_this.phone, user_intent, function(err, response) {
                        logUserMessageWithIntent(_this.phone, user_intent, response);
                        _this.callback(err, response);
                    });

                });

            });

        });

    },

    handleContact: function(input, callback) {
        // Store the contact info somewhere in the Database as a future user/lead

        callback(null);
    },

    handleLocation: function(input, callback) {
        getLastMessage(input.phone, function(err, data) {
            if (!data) {
                console.log('Help me! I\'m stuck');
                return;
            }

            if (data.intent === 'book_cab' || data.intent === 'get_cab') {
                var options = {
                    latitude: input.latitude,
                    longitude: input.longitude
                };

                CabService.getCabs(options, function(err, response) {
                    if (err) {
                        callback(err, null);
                        return;
                    }

                    var formatted_response = processCabResponse(response);
                    logRequestResponse(input, 'location', formatted_response);
                    callback(null, formatted_response);
                });
            } else {
                var response = "What do you want me to do with the location?";
                response += " Book you a cab? Or, save it for future?";

                logRequestResponse(input, 'location', response);
                callback(null, response);
            }
        });
    }
};

module.exports.Aryabot = Aryabot;
