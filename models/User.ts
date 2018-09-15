// const {mongoose} = require('./../db/mongoose');
import mongoose from './../db/mongoose';
import Role from './../models/Role';
import { ObjectID } from 'bson';
import { Document, Model, MongooseDocument } from 'mongoose';
import { NextFunction } from 'express';
// const {Role} = require('./../models/Role');

const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');


export interface IUserModel extends Model<IUser> {
    hashPassword(password: string): boolean;
}


export interface IUser extends Document {
    email: string;
    firstName: string;
    lastName: string;
    code: {
        auth_code: string;
        try: number
    };
    ID_card: string;
    phone: string;
    deleted: boolean;
    agreement: boolean;
    lead_counter
    role_id: ObjectID;
  }


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
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        trim:true,
        validate:{
            validator:validator.isEmail,
            message:'"{VALUE}" is not a valid email'
        }
    },
    ID_card:{
        type:String,
        required:true,
        unique:true,
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
    agreement:{
        type:Boolean,
        default:false,
        required:true
    },
    deleted:{
        type:Boolean,
        default:false,
        required:true
    },
    code:{
        auth_code:{
            type:String,
            minlength:4,
            trim:true,
            default: null,
        },
        try:{
            type:Number,
            default: 0,
            required: true
        }   
    },
    // lead_counter:{
    //     type:Number,
    //     default: 0,
    //     required: true   
    // },
    candidates:[{
        candidate_id:{
            type: mongoose.Schema.Types.ObjectId, ref: 'Candidate',
            required:true
        },
        status:{
            type:Number,
            default: 2,
            required: true   
        },
        attached:[{
            user_id:{
                type: mongoose.Schema.Types.ObjectId, ref: 'User',
                required:true
            },
            link:{
                type:Boolean,
                required:true,
                default:false
            }
        }]
    }],
    // attach_me:{
    //     type: mongoose.Schema.Types.ObjectId, ref: 'User',
    // },
    
    role_id:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Role',
        required:true
    },
    createdAt:{
        type:Date,
        required:true,
        default:Date.now()
    }
    

});

userSchema.methods.toJSON = function(){
    let user = this.toObject();

    delete user.code;
    // delete user.tokens;
    // console.log('User From toJSON response ',user)

    return user;
};


userSchema.methods.generateToken = function(){
    let user = this;
    let token = jwt.sign({_id:user._id.toHexString(),role_id:user.role_id._id},process.env.JWT_SECRET).toString();

        return token;
};

userSchema.methods.removeToken = function (token: String){
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


userSchema.pre('save', function (next: NextFunction) {
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


export const User = mongoose.model('User',userSchema);


// export default User;
