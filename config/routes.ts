const {app} = require('./../server');

import * as userController from './../controllers/userController';
import * as candidateController from './../controllers/candidateController';


app.post('/users', userController.createByUser);
app.post('/sendSms', userController.sendSms);
app.post('/users/login', userController.login);
app.post('/users/confirmSupport', userController.confirmSupport);



app.post('/candidate', candidateController.create);
