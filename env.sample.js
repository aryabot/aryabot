var env = {
    node_env: 'local',
    listen_port: '8000',
    mongo: {
        host: 'localhost',
        port: '27017',
        database: 'ai_logs'
    },
    redis: {
        host: 'localhost',
        port: '6379'
    },
    uber_service: {
        url: 'http://localhost:8000'
    },
    bore_kill_service: {
        url: 'http://localhost:8420'
    },
    ai_access_key: 'SAMPLE_AI_KEY_WHICH_IS_OBVIOUSLY_WRONG'
};

module.exports.env = env;
