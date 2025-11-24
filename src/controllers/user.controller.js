// working on more controller on real world projects ends with logic building

// some people build logic using leedcode problem

// some other build logic while doing DSA

// we have to divide a big problem, in small part, and try to solve each part at a time

// 70% - 80% people build logic using real world project

// Example
// we have to register a user,
// as register a user is the problem,
// we have to divide it in small parts, and try to solve each part at a time

// as we have asyncHandler, we will use it

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// asyncHandler is a higher order function which accept another function
// as we know that when we write a method through express we have access to error, req, res, next
const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     message: "ok response",
    // });
    // above we have send a json response

    // we have to register user instead of above message 
    // challange is registering a User 
    // we have to divide it in small parts as below
    // 1. get user details from frontend, which can be accessed using req.body, history and refresh token is not part of it
    // 2. validate user details (not empty), it is good to validate in frontend as well as backend
    // 3. check if user already exists, using username or email
    // 4. check for image, check for avatar 
    // 5. if user send image/avatar, we have to upload it to cloudinary
    // 6. creat user object (nosql database is used to store entry in database)
    // 7. remove password and refresh token field from user object before sending response
    // 8. check for user created successfully or not
    // 9. after successfully user creation, send response 
    // (we have to check if user is already exists or user has not send avatar image or if the avatar is not saved in cloudinary etc, these all are edge cases)

    // after knowing above steps and algorithm, we can easily build logic for registering a user

    // 1. we can get user detials from frontend which come from form or json in req.body and we can destructure it
    const { fullName, email, username, password } = req.body; 
    console.log("Just study the req.body : ", req.body);
    console.log("User email details : ", email);

    // 2. check if fullName is empty 
    // if(fullName === ""){
    //     throw new ApiError(400, "Full name is required");
    // }
    // we can check single field as above, we have to check each field as above, but it is not a good approach
    // we check multiple fields inside an array and using some method we can check if any field is empty
    // we can add more validation as well like password length, email format using regex etc
    // another approach is to use joi or yup library for validation
    // most production level code has a separate validation file for each controller
    if(
        [fullName, email, username, password].some((field) => 
        !field || field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required");
    }

    // 3. check if user already exists
    // mongoose queries like findOne, findById etc are async in nature, hence we can use await with them
    // we can use .then() and .catch() as mongoose queries are thenable as well
    // A Promise is a built-in JavaScript object that represents the eventual result of an asynchronous operation.
    // A thenable is any object that has a then method, but it doesn’t have to be a full Promise.
    const existedUser = await User.findOne({ $or: [ { email }, { username } ] })
    if(existedUser){
        throw new ApiError(409, "User already exists with this email or username");
    }

    // 4. check for image/avatar
    // as we know that we get all data/text in req.body which is functionality from express
    // req.file does not come from Express itself—it comes from Multer, the middleware you use for handling file uploads.
    // we can access image/avatar using req.file or req.files
    // it depends on how we are sending image from frontend
    // if we are sending single image, we can access it using req.file
    // if we are sending multiple images, we can access it using req.files
    // we have to check if req.file is present or not 
    const avararLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // if we don't upload coverImage and access it without using optional chaining, we get the error of "Cannot read properties of undefined (reading '0')" 
    // which can be fixed by adding optional chainging as below
    // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    // we can use below way as well to fix "Cannot read properties of undefined (reading '0')" error as below 
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >  0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    console.log("Just study req.files : ", req.files)
    if(!avararLocalPath){
        throw new ApiError(400, "Avatar image is required");
    }

    // 5. upload image to cloudinary
    // we have to upload image to cloudinary
    // we have created a utility for cloudinary in util/cloudinary.js
    // we can use that utility here
    // as uploadToCloudinary is async function, we can use await with it
    // we have to pass local path of image and folder name where we want to save image in cloudinary
    const avatar = await uploadOnCloudinary(avararLocalPath);
    console.log("Avatar upload response : ", avatar);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar){
        throw new ApiError(400, "Avatar image is required");
    }

    // 6. create user object
    // we can create user object using User model, which come from mongoose model
    // User can communicate directly with User collection in database
    const user = await User.create({
        fullName,
        avatar: avatar.url, // we have to save cloudinary url in database, not the complete response from cloudinary
        coverImage: coverImage?.url || "", // cover image is optional, hence we can use optional chaining or keep it empty string if not present
        email,
        password,
        username: username.toLowerCase(), // we can store username in lowercase for uniformity
    })

    // 7. remove password and refresh token from user object before sending response
    // as mongodb add _id to each document, we can use findById to get the user object again 
    // now we can use the select method to exclude password and refreshToken using -password and -refreshToken
    // select mathod is used to select specific fields from document, but using - we can exclude specific fields from document
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500, "User is not created successfully");
    }

    // 9. send response after successful user creation
    // it is better way to send response status before the json response as postman or frontend can easily identify the response status
    // and we can use our ApiResponse class to send response in standard format inside json method as below
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );


});

export { registerUser }
// we have to create a route when to run above controller 


// we can use form-data in body section of postman allow us to upload files as well

// we can select content-type at the three dot section of the right hand side of of adding values

// to exclude some data from submitting in the form, we can unckeck it at the left hand side

// we got error user already exist, because of not using await in front of User.findOne({ $or: [ { email }, { username } ] })

// we should use await untill finishing the task of findOne other execution will go to the next line without waiting for finding the User in User.findOne({ $or: [ { email }, { username } ] })

// we should use the keys in postman the same as we have used it in mongodb collection

// the _id which we get on each recored created on mongodb is in bson format not json format

// to configure postman, we can create folder and keep base url (which is common in all route) in environemt as use it in the starting of the url 
// we should write {{ then you will see the environemet name click on it. it will be added 
