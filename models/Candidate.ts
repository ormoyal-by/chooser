// const {mongoose} = require('./../db/mongoose');
import mongoose from './../db/mongoose';
import { ObjectID } from 'bson';
import { Document, Model } from 'mongoose';
// const {Role} = require('./../models/Role');

const validator = require('validator');


let candidateSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true,
        minlength:2,
        trim:true
    },
    about_us:{
        type:String,
        minlength:2,
        required:true,
        trim:true
    },
    logo:{
        type:String,
        required:true,
        trim:true,
        default: null
    },
    background:{
        type:String,
        trim:true,
        required:true,
        default: null
    },
    color_1:{
        type:String,
        trim:true,
        required:true,
        default: null
    },
    color_2:{
        type:String,
        trim:true,
        required:true,
        default: null
    },
    deleted:{
        type:Boolean,
        default:false,
        required:true
    },
    workers:[{
        type: mongoose.Schema.Types.ObjectId, ref: 'Worker',
        // required:true
    }],
    users:[{
        user:{
            type: mongoose.Schema.Types.ObjectId, ref: 'User',
            // unique:true
            // required:true
        },
        status:{
            type:Number,
            default: 1,
            required: true   
        }
    }],
    createdAt:{
        type:Date,
        required:true,
        default:Date.now()
    }
    

});


export const Candidate = mongoose.model('Candidate',candidateSchema);


// export default User;
