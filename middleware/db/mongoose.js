const mongoose = require('mongoose');
// var tunnel = require('tunnel-ssh');

mongoose.Promise = global.Promise;
// console.log('123123123');

// var config = {
//     host:'52.89.74.129',
//     privateKey:require('fs').readFileSync('./../../../../.ssh/smsSSH'),
//     port:22,
//     dstPort:23818,
//     localPort: 23818
// };

// console.log(config.privateKey);
// var server = tunnel(config, function (error, server) {
//     if(error){
//         console.log("SSH connection error: " + error);
//     }
mongoose.connect(process.env.MONGODB_URI,{ useNewUrlParser: true },(err,client) => {
    console.log('connected to Database');
}).catch(err => {
    console.log(err);
});
//     var db = mongoose.connection;
//     db.on('error', console.error.bind(console, 'DB connection error:'));
//     db.once('open', function() {
//         // we're connected!
//         console.log("DB connection successful");
//     });
// });



 
module.exports = {mongoose};