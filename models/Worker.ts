// const {mongoose} = require('./../db/mongoose');
import mongoose from './../db/mongoose';
import { ObjectID } from 'bson';
import { Document, Model } from 'mongoose';
import { NextFunction } from 'express';
// const {Role} = require('./../models/Role');

const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');


export interface IWorkerModel extends Model<IWorker> {
    hashPassword(password: string): boolean;
}


export interface IWorker extends Document {
    email?: string;
    firstName?: string;
    lastName?: string;
    auth_code?: string;
    ID_card?: string;
    phone?: string;
    deleted?: boolean;
    role_id: ObjectID;
  }


let workerSchema = new mongoose.Schema({

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
        required:true,
        trim:true,
        validate:{
            validator:validator.isEmail,
            message:'"{VALUE}" is not a valid email'
        }
    },
    password:{
        type:String,
        required:true,
        minlength:6,
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
    candidate:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Candidate',
        required:true
    },
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

workerSchema.methods.toJSON = function(){
    let worker = this.toObject();

    delete worker.password;
    // delete worker.tokens;
    // console.log('worker From toJSON response ',worker)

    return worker;
};


workerSchema.methods.generateToken = function(){
    let worker = this;
    let token = jwt.sign({_id:worker._id.toHexString(),role_id:worker.role_id._id},process.env.JWT_SECRET).toString();

        return token;
};

workerSchema.methods.removeToken = function (token: String){
    // change to header?
    const worker = this;

    return worker.update({
        $pull: {
            tokens:{
                token:token
            }
        }
    });
};


workerSchema.pre('save', function (next: NextFunction) {
    let worker = this;
    if(worker.isModified('password')){
        bcryptjs.genSalt(10,(err,salt) => {
            if(err) next('salt cannot generate');
            bcryptjs.hash(worker.password, salt, (err, encryptedPassword) => {
                if(err) next(err);
                worker.password = encryptedPassword;
                next();
            });
        });
    }else{
        next();
    };
});



workerSchema.statics.findByCredentials = function(email,password) {
    let Worker = this;
    return Worker.findOne({email}).populate('role_id').then(worker => {
        if(!worker) return Promise.reject('wrong password');
        return new Promise((resolve,reject) => {
            bcryptjs.compare(password, worker.password, (err,match) => {
                if(err) reject(err);
                if(!match) reject('wrong password');
                resolve(worker);
            });
        });
    });
};

workerSchema.statics.findByToken = function(token){
    let Worker = this;
    let decoded
    try{
        decoded = jwt.verify(token,process.env.JWT_SECRET);
    } catch(e){
        return Promise.reject(e);
    }
    return Worker.findOne({_id:decoded._id}).populate('role_id');
};


export const Worker = mongoose.model('Worker',workerSchema);


// export default User;
