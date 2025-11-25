// if we dont have an id field for a user model, mongoose will automatically create one for us, and it will in bson format
// we will upload our avatar and image in third party service which will give us a url of that image, so in database we will store that url as string
// we will keep image an video separate
// for tracking video history we can put all the video ids in an array in user model in watchHIsroty field

import mongoose, { model, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt, { compare } from "bcrypt";

// as direct encryption is not possible, we can use pre mongoose middleware to hash password before saving it to database

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        // if we are using username as searching field in user information in frontend, then we should create index on username for faster searching
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        // we should not multiple field as index, because it will create compound index, and it will take more space in database
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String, // coloudinary url
            required: true,
        },
        coverImage: {
            type: String, // coloudinary url
        },
        watchHistory: [
            { 
                type: Schema.Types.ObjectId, 
                ref: "Video" 
            }
        ],
        // we have to hash the password before saving it to database
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
        // we will come back to token
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

// mostly the use of pre middleware will be used in models for hashing password or updating timestamps
// we can use pre middleware on save, validate, remove, updateOne etc.
// pre middleware is like a hook/method which will be used as below
// pre accept the event and a function which will be called before that event
// the function should be regular function, not arrow function, because we have to use 'this' keyword inside the function
// as in arrow function 'this' will not work as expected, we wont be able to access the document using 'this'
// as the function will take time to hash the password, we can make it async function and use await inside it
// as pre is a middleware, we will have access to the next function, which we can call after our work is done 
// hence we have to pass next as parameter, and call it after hashing is done, and if we dont call next, the save operation will not complete
// hence we have to call next at the end of the function
userSchema.pre('save', async function (next){
    // we have to have below check, because if we are updating other fields, we dont want to hash the password again
    if(!this.isModified('password')) return next();
    // if(!this.isModified('password')){
    //     return next();
    // }
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

// we can add method after importing User model, which should be compared with the entered password during login
// we can add methods using methods property of schema, then writing the name of the method and assigning a function to it
// we have to pass the entered password as parameter to below function to compare with the hashed password stored in database
// inside the function, the password should be compared using bcrypt compare method
// compare method accepts two parameters, first is the entered password, second is the hashed password stored in database
// the return value of below fucntion is true or false based on comparison
userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password);
}

// we will use a method for generating token as below 
userSchema.methods.generateAccessToken = function(){
    // sign method create token for us
    // sign axpect payload, object, Buffer, secretKey, options, signOption
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
} 
userSchema.methods.generateRefreshToken = function(){
    // in refresh token we have less information 
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
} 

export const User = mongoose.model("User", userSchema);


// bcrypt is nodeJS package which is used for hashing passwords
// bcryptjs is javascript implementation of bcrypt, which can be used in frontend as well as backend
// we can use either bcrypt or bcryptjs for hashing passwords
// we will use bcrypt in this project


// jwt has made of three parts
// header.payload.signature, each part is separated by dot(.)
// header and payload are base64 encoded
// signature is created using header, payload and secret key

// jwt is bearer token, whoever bear it will accept it true (whoever has this token and request data, i will send data to him, it is like a key)
// access token ixpiry is less but refresh token expiry is longer

// we will use both session and cookies
// as we have used refreshToken in user model, but not access token that how it works 
