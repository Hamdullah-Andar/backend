import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
// we have to import router from express 

// as we were creating app from express , here we have to create route from Router

import { upload } from "../middlewares/multer.middleware.js";

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

export default router