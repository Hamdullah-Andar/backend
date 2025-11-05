import mongoose from "mongoose";
import { DB_NAME } from '../constants.js'

// Cannot find module 'D:\Projects\Tutorials\Chai aur Code\04 BackEnd\express-work\03backend\src\constants' imported from D:\Projects\Tutorials\Chai aur Code\04 BackEnd\express-work\03backend\src\db\index.js
// if we get above error, we can add .js to the end of ../constants.js as above 

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        // we can store the return value of mongoose.connect in a variable, which gives us an Object
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`)
        // read about the return value of connectionInstance in console for more knowledge, currently we want connection, and host value of it
    } catch (error) {
        console.log("MONGODB connection Failed ", error)
        process.exit(1)
        // we have access to process in Nodej, which has exit method with 0, 1 or other values passed to it
        // process.exit(0) is used for successful exit and process.exit(1) is Exit with Error 
        // as process come from NodeJS we don't need to import it. anything comes from NodeJS deos not need to be imported  
    }
}

export default connectDB