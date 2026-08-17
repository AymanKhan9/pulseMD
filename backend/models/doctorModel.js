const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    email : {type:String, required:true,unique:true},
    password: {type:String},
    role : {type:String},
    fullname: {type:String},
    image:{type:String},
    gender:{type:String},
    address:{type:String},
    age:{type:String},
    isverified : {type:Boolean,default:false},
    emailVerified : {type:Boolean,default:false},
    degree:{type:String},
    speciality:{type:String},
    regno:{type: Number},
    regyear:{type: Number},
    experience:{type:Number},
    starttime : {type:String},
    endtime: {type:String}
})

// Pinned to the existing "doctor" collection — mongoose would otherwise default to "doctors"
module.exports = mongoose.model("Doctor", doctorSchema, "doctor");