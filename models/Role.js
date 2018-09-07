const {mongoose} = require('./../db/mongoose');

var roleSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        minlength:2,
        unique:true
    }
});

var Role = mongoose.model('Role',roleSchema);

module.exports = {Role};