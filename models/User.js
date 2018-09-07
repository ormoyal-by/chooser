const {mongoose} = require('./../db/mongoose');
const {Role} = require('./../models/Role');

const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');


let userSchema = new mongoose.Schema({

    first_name:{
        type:String,
        required:true,
        minlength:2,
        trim:true
    },
    last_name:{
        type:String,
        minlength:2,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        validate:{
            validator:validator.isEmail,
            message:'"{VALUE}" is not a valid email'
        }
    },
    ID_card:{
        type:String,
        minlength:5,
        maxlength:9,
        trim:true
    },
    phone:{
        type:String,
        minlength:9,
        maxlength:11,
        unique:true,
        trim:true,
        required:true
    },
    deleted:{
        type:Boolean,
        default:false,
        required:true
    },
    role_id:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Role',
        required:true
    }
    

});

userSchema.methods.toJSON = function(){
    let user = this.toObject();

    delete user.password;
    // delete user.tokens;
    // console.log('User From toJSON response ',user)

    return user;
};


userSchema.methods.generateToken = function(){
    let user = this;
    let token = jwt.sign({_id:user._id.toHexString(),role_id:user.role_id._id},process.env.JWT_SECRET).toString();

        return token;
};

userSchema.methods.removeToken = function (token){
    // change to header?
    const user = this;

    return user.update({
        $pull: {
            tokens:{
                token:token
            }
        }
    });
};


userSchema.pre('save', function (next) {
    let user = this;
    if(user.isModified('password')){
        bcryptjs.genSalt(10,(err,salt) => {
            if(err) next('salt cannot generate');
            bcryptjs.hash(user.password, salt, (err, encryptedPassword) => {
                if(err) next(err);
                user.password = encryptedPassword;
                next();
            });
        });
    }else{
        next();
    };
});



userSchema.statics.findByCredentials = function(email,password) {
    let User = this;
    return User.findOne({email}).populate('role_id').then(user => {
        if(!user) return Promise.reject('wrong password');
        return new Promise((resolve,reject) => {
            bcryptjs.compare(password, user.password, (err,match) => {
                if(err) reject(err);
                if(!match) reject('wrong password');
                resolve(user);
            });
        });
    });
};

userSchema.statics.findByToken = function(token){
    let User = this;
    let decoded
    try{
        decoded = jwt.verify(token,process.env.JWT_SECRET);
    } catch(e){
        return Promise.reject(e);
    }
    return User.findOne({_id:decoded._id}).populate('role_id');
};


var User = mongoose.model('User',userSchema);


module.exports = {User};
