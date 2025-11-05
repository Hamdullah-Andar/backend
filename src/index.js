// require('dotenv').config()
// require('dotenv').config({path: './env'})
import dotenv from "dotenv";

import connectDB from "./db/index.js";
// Cannot find module 'D:\Projects\Tutorials\Chai aur Code\04 BackEnd\express-work\03backend\src\db\index' imported from D:\Projects\Tutorials\Chai aur Code\04 BackEnd\express-work\03backend\src\index.js
// we may get above error which will be resolved by adding .js and the end of /db/index.js

dotenv.config({
  path: "./env",
});

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
connectDB();

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
