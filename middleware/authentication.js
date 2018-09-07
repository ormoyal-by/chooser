const {User} = require('./../models/User');

const authentication = (req,res,next) => {
    console.log(req.originalUrl, req.method)
    // if ( req.path == '/users/login' || req.path == '/favicon.ico' ) return next();
    if ( req.path == '/users/login') return next();

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