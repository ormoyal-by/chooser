require('./config/environment');

import {Request, Response, NextFunction, Express} from "express";
import express from "express";
import bodyParser from "body-parser";

// const express = require('express');
// const bodyParser = require('body-parser');

const {responseErrors} = require('./responses/response');

// const moment = require('moment');
// const _ = require('lodash')

// const {upload} = require('./pictures');

const {authentication} = require('./middleware/authentication');
const {admin} = require('./middleware/admin');



const app = express();

var router = express.Router();

let port = process.env.PORT;

app.listen(port, () => {
    console.log(`run on port ${port}`);
});

export const allowedRequests = [
    '/users/byLink',
    '/users/login',
    '/sendSms',
    '/confirmSupport',
    '/create'
]


app.use(bodyParser.json());
app.use(authentication);






// app.use('/orders', orders);


// all delete request in same middleware?
// middleware that check res, if error send check if error isn't {}, if it is send error.message

// app.post('/orders',upload, function(err, req, res, next){
//     if (err) {
//         return res.status(400).send(err);
//     }else{
//         next();
//     }
// });
// app.post('/orders/files/:id',upload, function(err, req, res, next){
//     if (err) {
//         return res.status(400).send(err);
//     }else{
//         next();
//     }
// });

// uncomment to active middleware

// app.post('/users',admin);
// app.post('/users/addProjectManagers/:id',admin);
// app.delete('orders/:id',manager)


// delete this middleware?
// app.get('/users/getProjectManagers',superManager);
// app.post('/projects/projectManagers',superManager);



// app.use(function (req, res, next) {
//     console.log('Time SS -:', moment().format())
//     next()
// });
// app.use(function (req, res, next) {
//     console.log('Time:', Date.now())
//     next()
// });

// app.all('*',function (req,res,next){
//     if ( req.path == '/users/login' || (req.path == '/users' && req.method == 'POST')) return next('route');
//     console.log('123')
//     next()
// },admin)


// handler for the /user/:id path, which prints the user ID
// app.post('/users/login', function (req, res, next) {
//     res.end(req.body.email)
// });







export {app, responseErrors};

require('./config/routes');


// require('./controllers/UserController');
// require('./controllers/SeedController');
// require('./controllers/CustomerController');
// require('./controllers/OrderController');
// require('./controllers/ProjectController');
// require('./controllers/ShowerController');
// require('./controllers/KitchenController');
// require('./controllers/StairsController');
// require('./controllers/WindowController');
// require('./controllers/EventController');
// require('./controllers/RepairController');

export {}
