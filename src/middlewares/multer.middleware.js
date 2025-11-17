import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // req is the incoming request object
    // file is the file being uploaded
    // cb is the callback function to specify the destination
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // cb(null, file.fieldname + '-' + uniqueSuffix)
    // above two lines can be used to give unique name to file, which is used in above cb as: cb(null, file.fieldname + '-' + uniqueSuffix)
    cb(null, file.originalname);
    // first parameter of cb is for error handling, null means no error
    // as giving originalname is not a good idea as user can upload multiple file with the same name
    // so better to use uniqueSuffix approach, we will add it later if needed
  },
});

// export const upload = multer({ storage: storage })
export const upload = multer({ 
    storage 
});


// whenever user upload file on some route, we can call our storage middleware for file handling 