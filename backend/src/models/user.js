const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : true,
        minLength : 4,
        maxLength : 50,
    },
    lastName : {
        type : String,
        required : true
    },
    emailId : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error("Invalid Email ID");
            }
        },
    },
    password : {
        type : String,
        required : true,
        validate(value) {
            if(!validator.isStrongPassword(value)) {
                throw new Error("Enter a strong password");
            }
        },
    },
    age : {
        type : Number
    },
    gender : {
        type : String,
        enum : {
            values : ["Male", "Female", "Other"],
            message : `{VALUE} is not valid gender type`
        },
        // validate(value) {
        //     if(!.["Male", "Female", "Other"].includes(value)) {
        //         throw new Error("Invalid Gender");
        //     }
        // }
    },
    photoUrl : {
        type : String,
        default : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
        validate(value) {
            if(!validator.isURL(value)) {
                throw new Error("Invalid URL");
            }
        },
    },
    about : {
        type : String,
        default : "Hey there! I am using DevTinder."
    },
    skills : {
        type : [String]
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
}, {timestamps : true});

userSchema.index({firstName : 1, emailId : 1});

userSchema.methods.getJWT = async function() {
    const user = this;
    const token = await jwt.sign({_id :user._id}, "DEV@Tinder$0409", {expiresIn : "7d"});
    return token;
}

userSchema.methods.validatePassword = async function(passwordInputByUser) {
    const user = this;
    const passwordHash = user.password;

    const isPasswordValid = await bcrypt.compare(passwordInputByUser, passwordHash);
    return isPasswordValid;
}

module.exports = mongoose.model("User", userSchema);
