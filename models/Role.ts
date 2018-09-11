// const {mongoose} = require('./../db/mongoose');
import mongoose from './../db/mongoose';

var roleSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        minlength:2,
        unique:true
    }
});

const Role = mongoose.model('Role',roleSchema);

export default Role;