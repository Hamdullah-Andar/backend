import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// (async function() {

//     // Configuration
//     cloudinary.config({ 
//         cloud_name: 'dmxk0jqjx', 
//         api_key: '274545159858318', 
//         api_secret: <> // Click 'View API Keys' above to copy your API secret
//     });
    
//     // Upload an image
//      const uploadResult = await cloudinary.uploader
//        .upload(
//            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//                public_id: 'shoes',
//            }
//        )
//        .catch((error) => {
//            console.log(error);
//        });
    
//     console.log(uploadResult);
    
//     // Optimize delivery by resizing and applying auto-format and auto-quality
//     const optimizeUrl = cloudinary.url('shoes', {
//         fetch_format: 'auto',
//         quality: 'auto'
//     });
    
//     console.log(optimizeUrl);
    
//     // Transform the image: auto-crop to square aspect_ratio
//     const autoCropUrl = cloudinary.url('shoes', {
//         crop: 'auto',
//         gravity: 'auto',
//         width: 500,
//         height: 500,
//     });
    
//     console.log(autoCropUrl);    
// })();

// above code is for testing cloudinary setup for the cloudinary configuration 

cloudinary.config({ 
    // this is our cloudinary configuration 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

// below is our organized file upload to cloudinary 
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        // upload the file on cloudinary
        // we have many option 
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file uploaded successfully 
        console.log("File is uploaded on cloudinary", response.url)
        return response

    } catch (error) {
        // remove the locally saved temporary file, as the upload operation got failed
        fs.unlinkSync(localFilePath)
        return null
    }
}

export { uploadOnCloudinary }

// 90% work is in backend for file uploading 
// frontend can only make upload file option and send a url to backend

// when we learn file uploading we can upload any type of file, like image, vedio, pdf and more

// file handling is backend responsibility 

// mostly file handling is done on third party service, or upload it on AWS (uploading file on AWS and other third party service are the same). it is not done in someone own server
// express also does not have capability of file uploading, it need alot of configuration 
// we will not have file uploading in all API endpoint, so it is better to keep it in util folder or use it as a middlware, we will use it for all types of file
// we can use it as middlware in endpoint, whenever it is required.
// we will use cloudnary (third party service) for file uploading. cloudnary is AWS wrapper means it use AWS behind the scene. it is connected with AWS

// we need to use multer or express-fileupload package for file handling

// multer is nodejs middlware for handling multipart/form-data

// we have install cloudnary and multer

// cloudnary is an sdk
// we will store our file in cloudnary using multer
// we will take a file using multer and store it in our server in memory or temp folder, and from our server we will store it in cloudnary.
// we can directly store the file in cloudnary, but it is standard practice to store it in our server for faster access.

// we can put cloudnary configuration in util folder, we can keep it in services too

// after storing a file to our server using multer we can give the file path to cloudinary to save it cloudinary

// we can fs nodejs library for managing file in our server
// we use fs here for accessing file path
// unlink is used to delete a file from our server after uploading it to cloudnary