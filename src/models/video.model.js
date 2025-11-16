// we will upload video also in a third party service and store it url as string in database 

import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        // we can store small file and image as media file, which is not good practice for video file, because video file is large in size, 
        // it put load on database, so we will store video file in third party service and store its url in database
        videoFile: {
            type: String, // cloudinary url
            required: true
        },
        thumbnail: {
            type: String, // cloudinary url
            required: true
        },
        title: {
            type: String, 
            required: true
        },
        description: {
            type: String, 
            required: true
        },
        // duration will come from third party service after uploading video
        duration: {
            type: Number, 
            required: true
        },
        views: {
            type: Number, 
            default: 0
        },
        isPublished: {
            type: Boolean, 
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId, 
            ref: "User",
        },
    },
    {
        timestamps: true
    }
)

// after importing mongoose-aggregate-paginate-v2 package we can inject it as plugin before exporting the model
// after plugin in the mongooseAggregatePaginate we can use aggregation pipline 
videoSchema.plugin(mongooseAggregatePaginate);
// we can inject plugins like pre, post and more
// we can write enough middleware in mongoose models

export const Video = mongoose.model("Video", videoSchema);

// mongoose-aggregate-paginate-v2 mongoose package is used for pagination in aggregate queries
// mongodb also has aggregation pipeline framework which is used for complex queries, which was added to mongodb later (in version 2.2)

// we will install mongoose-aggregate-paginate-v2 for now using "npm i mongoose-aggregate-paginate-v2"
// after installation we can inject it as plugin in this file