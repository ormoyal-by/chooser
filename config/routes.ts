const {app} = require('./../server');

import * as userController from './../controllers/userController';
import * as candidateController from './../controllers/candidateController';


app.post('/users/byUser', userController.createByUser);
app.post('/users/byLink', userController.createByLink);
// create with token
app.post('/users/create', userController.create);
app.get('/users', userController.getUsers);

app.post('/sendSms', userController.sendSms);
app.post('/users/login', userController.login);
app.post('/users/confirmSupport', userController.confirmSupport);



app.post('/candidate', candidateController.create);
