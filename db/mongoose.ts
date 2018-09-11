const mongoose = require('mongoose');
// import mongoose from 'mongoose';
import { MongoError } from 'mongodb';
// var tunnel = require('tunnel-ssh');

mongoose.Promise = global.Promise;

process.env.MONGODB_URI = process.env.MONGODB_URI == undefined ? '' : process.env.MONGODB_URI;

mongoose.connect(process.env.MONGODB_URI,{ useNewUrlParser: true }).then(() => {
    console.log('connected to Database');
}).catch(err => {
    console.log(err);
    process.exit();
});

 
export default mongoose;