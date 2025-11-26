import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
// we have to import router from express 

// as we were creating app from express , here we have to create route from Router

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(
    // upload is a middlware for handling file upload using multer
    // we have many options in multer like single, array, fields, none etc
    // single is used to upload single file
    // array is used to upload multiple files with same field name
    // fields is used to upload multiple files with different field names
    // as we have avatar and coverImage, we will use fields method as below 
    // we will use an arry to specify multiple fields and put object for each field with name and maxCount
    // it will allow us to upload avatar and coverImage in a single request
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

// secured routes which will be accessable after login
// we have used verifyJWT to verify the user token 
// we can use as many middlware as we want
// as we have assigned req.user = user, hence we have access to req.user in logoutUser controller 
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)
export default router