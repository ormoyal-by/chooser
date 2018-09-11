module.exports.admin = function(req,res,next){

        if(req.user.role_id.name === 'admin'){
            console.log('Admin Police ')
            next();
        }else{
            return res.status(400).send('only admin can access')
        }
};