var env = process.env.NODE_ENV || 'development';
console.log('**env** ', env, '\n**port** ', process.env.PORT);
// npm run prod
if (env === 'development' || env === 'test' || env === 'production') {
    var config = require('./config.json');
    var envConfig_1 = config[env];
    Object.keys(envConfig_1).forEach(function (key) {
        console.log(envConfig_1[key]);
        process.env[key] = envConfig_1[key];
    });
}
