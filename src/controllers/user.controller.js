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
                // $set: {
                //     refreshToken: undefined
                // }

                // instead of set refreshToken to undefined which does not remove the token, we can use unset and set flag of to one as refreshToken: 1, which will work fine (remove the refreshToken from the document)
                $unset: {
                    refreshToken: 1
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

const changeCurrentPassword = asyncHandler(async(req, res) => {
    
    // steps to follow for changing user password
    // 1. get oldPassword, newPassword from body 
    // 2. get current user information by id from req.user._id which we have assigned in verifyJWT
    // 3. check user current password whether it is correct or not using isPasswordCorrect method in user model 
    // 4. throw error if password is not correct which is test by isPasswordCorrect 
    // 5. if old password is enter correctly then, update user.password with newPassword, and updating user.password with newPassword will be encrypt automaticaly as we have use userSchema.pre method in User model 
    // the userSchema.pre method will run after saving updating the password, which can be done by using user.save({validateBeforeSave: false})
    // in user.save({validateBeforeSave: false}) the {validateBeforeSave: false} means Save this document without running validation.
    // 6. return user the response of updating the password 

    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Password changed Successfully")
    )

})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user data fetched successfully"))

})

const updateAccountDetails = asyncHandler(async(req, res) =>{

    // step to follow for updating user details 
    // 1. get user data from req.body 
    // 2. check if all updating data is available, if not throw error 
    // 3. run findByIdAndUpdate to find and update and use select method to limit password
    // 4. return the response to the user 
    const {fullName, email } = req.body

    if(!fullName || !email){
        throw new ApiError(400, "All fields are required ")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName, 
                email
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
})
// an advice 
// create separate controller for updating a document or image. ex: a user document or image and give an update image to hit that controller to update the image

const updateUserAvatar = asyncHandler(async(req, res) => {
    // now we have to add user profile/file update route 
    // in it route we have to use multer and auth middleware in mind 

    // steps to follow for updating avatar 
    // 1. get new avatar file using multer from req.file 
    // 2. update user new avatar (we can directly save the avatat to database, but we want to save it in cloudinary)
    // 3. send response to user 
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    // TODO: Delete Old Image in cloudinary 

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar Image updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    // now we have to add user profile/file update route 
    // in it route we have to use multer and auth middleware in mind 

    // steps to follow for updating coverImage 
    // 1. get new coverImage file using multer from req.file 
    // 2. update user new coverImage (we can directly save the avatat to database, but we want to save it in cloudinary)
    // 3. send response to user 
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover Image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading coverImage")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover Image updated successfully")
    )
})

const getUserChannelProfile = asyncHandler(async(req, res) =>{
    
    // step to get user channel profile 
    // 1. get username from params (url) 
    // 2. check if we dont have username in params 
    // 3. instead of finding user by username, we can use aggregation directly 
    // note: aggregation accept array and return array 
    // 4. in first pipeline we use $match to find the user which matches the username (we will get single user record)
    // 5. in second pipeline we will use $lookup to join User to Subscription and count the subscriber base on channel
    // note: localField belong to User model and foreignField belong to Subscription model
    // 6. in third pipeline we will use $lookup to join User to Subscription and count the subscribedTo base on subscriber
    // 7. in fourth pipeline we have to add subscriber and subscribedTo using $addFields, 
    // Note: using $size we can get the count of subscriber and subscribedTo 
    // and we will use cond which accept 3 parameter "if then and else" to find if the user (me) is subscribed to channel or not
    // using $in we can find if im in the subscriber list of not, $in can check value in both array and object
    // 7. in fifth pipeline we can use $project to show only desired vlaue by giving them 1 value and making it's flag on
    // Note: aggregation pipeline return an array which has one/many objects
    // 8. check the length of channel, to confirm if it is available or not 
    // 9. return the first value of channel array 

    // we have to join subscription model to user model, where we want all subscription information to be available in user model, and it is called left join

    // aggregation pipline has many stages, and each stages are called pipline which process documents

    // each stage perform an operation on the input document (if we filter data of a model on some criteria, that filtered value will be input for next pipline)

    // we can write aggregate after the model, and aggregate accepts an array, which includes many object, and each object is a stage/pipline.

    // for example: we have two model
    // one is book and other is author

    // book model includes below documents
    // _id: 1
    // title: "The Great Book"
    // author_id: 100
    // genre: "Classic"

    // where author_id is another model id (here it is author id)

    // and our author includes below documents:
    // _id: 100
    // name: "Author name 100"
    // birth_year: 1893

    // if left join the complete author document will be shown in author_id of books model

    // usually in first pipeline we can use $match which is siilar to where class (but we dont need it right now)

    // we will use lookup for joinging the tables as $lookup, currently we are trying to join books model to Author model
    // in lookup we will have from (which document to join, ex: "authors"), localField (field which is books table ex: "author_id"), foreignField (field which is author table, ex: "_id") and as (name the resutl value, ex: author_details)

    // the result value will be an array, we will get the first value of the array as object

    // we can store the result value in variable in try to return the first item of array

    // or we can use another pipeline as below

    // $addFields: which add a field which is not available in either of the table ex: taking first name and last name and combining them as fullname in a new field

    // we can manipulate the result value of first pipline using an expression as below (which will give us the first element of the array, which is the author details object)
    // $addFields {
    //     author_details: {
    //         $first: "$author_details"
    //     }
    // }	

    // or we use below manipulation for returning the author_details value as below (which will also give us the same value as above pipline, giving us the first element of the author_details array)
    // $addFields {
    //     author_details: {
    //         $arrayElemAt: ["$author_details", 0]
    //     }
    // }

    // study about the $project, $populate and more in documentation
    // $project is used to show the specified fields only

    const { username } = req.params

    if(!username?.trim()){
        throw new ApiError(400, "username is not missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1, 
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])
    console.log("Channel Value : ", channel)

    if(!channel?.length){
        throw new ApiError(400, "Channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )

})

const getWatchHistory = asyncHandler(async(req, res) => {
    
    // step to getWatchHistory 
    // 1. first pipeline is $match to find the user using it's id
    // Note: req.user._id gives us a sting but mongodb convert it to mongodb id 
    // Using aggregation pipline we have to convert the id ourself to mongodb id as new mongoose.Types.ObjectId(req.user._id)
    // 2. in second pipline we have to use $lookup to join vedios and user tables 
    // Note: as we need nested pipline we can add pipline key inside the $lookup and nested pipeline which is an array and it accept stage/pipeline inside it
    // hence we will use $lookup inside the nested pipline and add $lookup from users and use another pipline inside nested $lookup and use $project stage/pipline in it to show only required values 
    // 3. return the response as user[0].watchHistory, as we are intersted in watchHistory only, not other data of user

    // as we store vedio id in watchHistory, 
    // as we need watchHistory, which we can do using $lookup to have vedio id in user watchHistory, but as we can see we have owner inside vedio model too which is user again, we have to use lookup once again to get/join user details
    // hence we need to do nested lookup

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200, user[0].watchHistory, "Watch History fetched successfully")
    )
})

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}
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
