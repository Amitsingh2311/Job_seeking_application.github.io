import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, "Please provide your name!"],
        minLength : [3,"Name must be contain at least 3 characters!"],
        maxLength : [30,"Name cannot exceed 30 characters!"],
    },
    email:{
        type:String,
        required: [true,"Please provide your email"],
        validate :[validator.isEmail, "Please provide a valid email!"],
    },
    phone : {
        type: Number,
        required : [true,"Please provide your phone number."],
    },
    password:{
        type:String,
        required : [true, "Please provide your password!"],
        minLength :[3,"Password must be contain at least 8 characters!"],
        maxLength : [30,"Password cannot exceed 32 characters!"],
        select: false,         //when we GET the data then password not shown by this.
    },
    role:{
        type:String,
        required :[true,"Please provide your role"],
        enum:["Job Seeker", "Employer"],          // only this value can entered(enum usee this purpose)
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
});


//hashing the password
userSchema.pre("save",async function (next) {                   //userschema.pre 
    if(!this.isModified("password")){
        next()
    }
    this.password = await bcrypt.hash(this.password, 10); 
});



//Comparing password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.password);  
};



//GENEARTING A JWT TOKEN FOR AUTHORIZATION
userSchema.methods.getJWTToken = function (){
    return jwt.sign({id:this._id}, process.env.JWT_SECRET_KEY,{
        expiresIn : process.env.JWT_EXPIRE,
    });
};



export const User = mongoose.model("User",userSchema);
