import { allowedRequests } from "./../server";

const {User} = require('./../models/User');

const authentication = (req,res,next) => {
    console.log(req.originalUrl, req.method)
    // if ( req.path == '/users/login' || req.path == '/favicon.ico' ) return next();
    // let requests = Object.keys(allowedRequests);
    console.log(allowedRequests, req.path);
    // allowedRequests.forEach(request => {
    for(var i = 0; i < allowedRequests.length; i++){
        console.log('req.path in allowedRequests ',req.path.includes(allowedRequests[i]));

        if (req.path.includes(allowedRequests[i]) ){
            return next();
            break;
        } 
    }



    let token = req.header('x-auth');
    User.findByToken(token).then(user => {
        if(!user)
            return Promise.reject('unable to fetch user');

        if(!user.role_id.name)
            return Promise.reject('unable to fetch Role');

        req.user = user;
        req.token = token;

        return next();
    }).catch(e => {
        res.status(401).send(e);
    });
};

module.exports = {authentication};