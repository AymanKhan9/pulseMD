const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
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
    bloodgroup:{type:String}
})

// Pinned to the existing "patient" collection — mongoose would otherwise default to "patients"
module.exports = mongoose.model("Patient", patientSchema, "patient");
