// require('dotenv').config()
// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

import connectDB from "./db/index.js";
import { app } from "./app.js";
// Cannot find module 'D:\Projects\Tutorials\Chai aur Code\04 BackEnd\express-work\03backend\src\db\index' imported from D:\Projects\Tutorials\Chai aur Code\04 BackEnd\express-work\03backend\src\index.js
// we may get above error which will be resolved by adding .js and the end of /db/index.js

// dotenv.config({
//   path: "./env",
// });
// above dotenv.config({path: "./env",}); show error but below works fine, because in above config file is searching for env file which is not present
// but dotenv.config() works fine as it search for .env file by default
// dotenv.config();
// I have added dotenv at the top of the file to make sure that all the environment variables are loaded before any other module is imported

// As early as possible in your application, import and configure dotenv:
// because other part of our program may have used value from dotenv
// hence we can load our dorenv in the file which load at the begining of the program/application
// hence we put at the top of our index.js file
// require('dotenv').config({path: './env'}) is the proper syntax, for configuering dotenv, but using require vilate the consistency of the program
// we have to resolve the consisteny issue, but it works still as well as it is
// hopely this issue to be resolve in upcoming version of dotenv, but we can imporve at as below
// the impoved version of it is as import dotenv from 'dotenv'
// and we can configure it as dotenv.config({ path: './env'})

// we can add an expermintal feature in our config file in scripts section of it as below, which allow us to load out dotenv file directly 
//  "scripts": {
//     "dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js"
//   },
// the dotenv will eventullay come and run here
// it experemental falg was used in early 16 or 17 version of NodeJs, and it is not required in 18 and greater NodeJS version 

// import and executed connectDB() as below
connectDB()
.then(() => {
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running at port : ${process.env.PORT}`);
  })

  // Assignment
  app.on("error", (error) => {
    console.log("Error while connecting to backend : ", error);
  })

})
.catch((err) => {
  console.log('MONGODB connection failed : ', err);
})
// as connectDB is async method it returns a promise
// as we know that we can have .then() and .catch() after the returned promise as above 

// using express we focus mainly on two major things one of it is Request and other is Response 
// in request of express, we mainly focus on two things, one of it is req.params and other is req.body

// when data come from a URL it mostly comes from req.params, when we see a question mark (?) then "search" key then equal to sign "=" then a term in URL, it is called params
// in req.body we can have data in different format like form or json etc, we need to do some configuration for it, we don't need body-parser now as it is already included in express, it was used in previous version 
// we can data from cookies too, we will cover how to set cookies on user broswer securely and how to read it.
// we need cookie-parser and cors packages to install 
// most of the time we use middleware through app.use(), 
// we can also use app.use() for configuration setting

// below is a good aproach, but we can have another approach too as above where we create db connection file in db folder and import it in index.js file

// import express from 'express'
// const app = express()

// // we can use ; it the begining of IFFE for cleaning purpose
// ;( async () => {
//     try {
//         await mongoose.connect(`${process.eve.MONGODB_URI}/${DB_NAME}`)
//         throw error
//         app.on('error', (error) => {
//             console.log('Error : ', error)
//             throw error
//         })
//         app.listen(process.env.PORT, () => {
//             console.log(`App is listening on port ${process.env.PORT}`)
//         })
//     } catch (error) {
//         console.log("ERROR: ", error)
//         throw error
//     }
// })()

// // after creating connecion function we can use express app too
// // we can use app.on if we incouter error with our express error
