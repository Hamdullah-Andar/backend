// this middleware will verify whether the user is available or not 
// we are verifiying the user base on accessToken if he is loggedin or not, or he has valid accessToken or not
// we have to use next paramter in middleware which passes the process to next middleware or next function in the route 

import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

// as req, next are used but res is not used 
// when it is not used we can put _ instead of res which is not used as below 
export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        // req has access to cookie, which is give to req using app.use(cookieParser())
        // and we have access to accessToken from the res of loginUser controller, where we have set both accessToken and refreshToken
        // hence we will access accessToken cookie as below 
        // if we dont have accessToken, we can use Optional chainging 
        // we can use req.header for mobile user to checking accessToken as below, where use send custom header
        // mostly header will be named as Authorization 
        // we can send custom header using postman too as Authorization as key and Bearer "wer.." as value 
        // as the header will look like Authorization: Bearer <token> we have to take the token value only using replace method of javascript as below 
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }
    
        // if we have token we can verify it using verify method of jwt as below
        // verify method of jwt required the token and "secret key"/"public key" as below 
        // we may use await for verifying jwt token, we can add it later if required 
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        // now we will find the user by it's token 
        // as we have generated token using _id, email, username, fullName of User, hence after decoding the accessToken we can have access to _id, email, username, fullName
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
    
        // if we dont have user we can tell the user as invalid token
        // as we have not found any user using the id which is taken from decodedToken 
        if(!user){
            // TO_DO:  we will have discuss here about frontend
            throw new ApiError(401, "Invalid Access Token")
        }
    
        // if we have user then that is the most important section of this middleware 
        // if we have user we will assing the value of user to req.user as below or we can name it as req.loggedinUser = user or any other name we want
        // and then we will call next() method 
        req.user = user
        next()
    
        // easy way to put a code snippet in try catch to select the code snippent and start typing try and select trycatch 
        // the select snippet will got to try section automatically 
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }

})