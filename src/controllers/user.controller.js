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
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        // find user by id as below
        const user = await User.findById(userId)
        // generate access token using generateAccessToken method as below
        const accessToken = user.generateAccessToken()
        // generate refresh token using generateRefreshToken method as below
        const refreshToken = user.generateRefreshToken()

        // put refreshToken to database as below
        user.refreshToken = refreshToken
        // sava it in the database 
        // while saving it to database, we have to use our password, 
        // but here we have not used our password instead we can pass { validateBeforeSave: false } as below
        // it mean don't validate the save request, (I know what am i doing)
        await user.save({ validateBeforeSave: false })        

        // now we have to return access and refresh token to user 
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Some thing went, while generating access and referesh token ")
    }
} 

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

const loginUser = asyncHandler(async (req, res) => {

    // we have to folow below algorithm for loging a user 
    // 1. get email or username and password from req.body
    // 2. check email or username avalibility
    // 3. find the user 
    // 4. check user password 
    // 5. send access and refresh token to user
    // 6. send access and refresh token in secure cookies

    const { email, username, password } = req.body

    // if(!username || !email){ 
    // as above logic was not valid for checking if none of username or email was available the error should be thrown
    // if(!(username || email)){
    //     throw new ApiError(400, "username or email is required")
    // }
    // or we can use below code to to check if neither username or email are sent in body error should be thrown 
    if(!username && !email){
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    // as we have isPasswordCorrect, we will use it 
    // we will pass the user recieved password 
    // User is availabe therough mongoose  
    // but our defined method as isPasswordCorrect is accessable through user 

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid User credentials")
    }

    // as we will use access and refresh token generation alot, hence we will create a separate method for it as generateAccessAndRefreshTokens above
    const { accessToken, refreshToken }= await generateAccessAndRefreshTokens(user._id)

    // currently the user does not have accessToken/refreshToken in it's refreshToken field
    // we have to update the user object or make another query to fetch updated user data from database which has a value in refreshToken 
    // we have to decide whether we have to make a query or update user object 
    // we will make a query to fetch user data as below as limit password and refreshToken
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // now will send the cookies, we have to design options, options in nothing but an object as below
    // after making the httpOnly and secure true in options it make the cookies updatable in server only, it can not be modified in frontend
    // it is accessable in frontend, but not Modifiable in frontend, it is updatable in server only   
    const options = {
        httpOnly: true,
        secure: true
    }

    // now we want to return the response send refresh token in setting cookies as below, we can set as many cookies as we want
    // we can set cookies using cookie() method, which accept a Key, a value and option which we have defined above 
    // and finally add json response to the res as below 
    // the reason why we are sending accessToken and refreshToken again in json, while we have set it in cookies, is that the user might want to save accessToken and refreshToken in localStorage 
    // while sending it in json is not good practice, but if user want to store it in localStorage we can send it as below in json 
    // as ApiResponse expect statusCode, data, and message, we passing it to ApiResponse as below 
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
})
// we can create it's related route in user.routes.js

const logoutUser = asyncHandler(async(req, res) =>{

        // we have to do below step to logout user 
        // 1. clear the cookies 
        // 2. remove the refreshToken in Uer model 
        
        // we have get userId from User model using a middleware which we use in multiple places
        // we have used "upload" middleware in register route in user.routes.js and used "use" middlware in ap 
        // using the app.use(cookieParser()) in app.js we can access cookie in req and res as we have accessed it in loginUser controller as res.cookie
        // hence we can access it in req too. as req.cookie 
        // we can define our own middleware here as well, in fact we will design our own middlware as auth.middleware

        // to remove the user refreshToken we can use findByIdAndUpdate which is used to find and update user 
        // we will use req.user data which we have assinged from user value in verifyJWT middleware 
        // and set the refreshToken to undefined 
        // and use new: ture to update the change value in response
        await User.findByIdAndUpdate(
            req.user._d,
            {
                $set: {
                    refreshToken: undefined
                }
            },
            {
                new: true
            }
        )

        // refreshToken is removed from database, 
        // now we want to clear the cookie, foe clearing cookie we need below options as well
        // in return we send res and clear accessToken and refreshToken from cookie in json we send empty object 
        const options = {
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logout Successfully"))

        // as we may use all the verifyJWT log direclty in logoutUser, but for reusability to have put it in auth.middleware 
        
})
// we can create it's related route in user.routes.js

const refreshAccessToken = asyncHandler(async(req, res) => {

    // steps to follwo 
    // 1. get refresh token from cookies 
    // 2. compare accessToken with refresh token 
    // 3. decode Refresh token 
    // 4. get user information by decoded refresh token _id 
    // 5. compare refresh token with the refresh token in database 
    // 6. if token are the same generate new access and refresh token 
    // 7. send accessToken and refreshToken to user in res 
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        // below throw error is actually is API response (it is error response)
        // sending error is essential here to avoid fake 200 response, we get 200 ok reponse and the application not working as expected which is very bad
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invalid Refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access Token Refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid Refresh Token")
    }

    // refreshAccessToken preparation/converstaion
    // as we have set cookie in loginUser 

    // checking it using postman will give us cookies in cookie tab of the response

    // in cookies tab we will see accessToken and refreshToken row and other values

    // we will add all route in user collection to give it to frontend user after exporting it

    // logout can be handle in get, but we have handled it using post

    // Access token and refresh Token:
    // is used for not using the password agian for login

    // access token is short lived: will not be store any where, it will be availabe for the user

    // "refresh token"/"session storage" is long lived: it will be store in database

    // instead of loging the user can request refreshing the access token

    // Access and Refresh Token will be the same

    // when the user access token expires, the user can request for refreshing access token, through an endpoint to refresh the access token (validating the access token)

    // for refreshing the access token, the invalid access token will be compared with refresh token, if both are the same, both access token and refresh token will renewed, the new refresh token will be saved in database, and the new access token will be give to user to access resource

    // it is similar to login again


    // AI comment on Access and Refresh Token 
    // is access and refresh token will be the same

    // Short answer: nope — they’re always different, and for good reasons.

    // Here’s the quick rundown:

    // 🔑 Access Token

    // Short-lived (minutes)

    // Used on every request to protected routes

    // If stolen, the damage window is small

    // 🔁 Refresh Token

    // Long-lived (days/weeks)

    // Stored more securely (httpOnly cookie, DB, etc.)

    // Used ONLY to get a new access token

    // Never sent on normal API calls

    // Why they must be different

    // Security:
    // If they were the same and an attacker stole it, they'd gain long-term access.

    // Responsibilities differ:
    // One authenticates requests. The other renews authentication.

    // Rotation:
    // Refresh tokens are often rotated or invalidated in the DB.

})

export { registerUser, loginUser, logoutUser, refreshAccessToken }
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
