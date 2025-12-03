import express, { request, urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// app.use is used for middleware and configuration, we can study out it in https://www.npmjs.com/package/cors
// if we pass cors() to it as app.use(cors()), we have done our Work, it means we have allowed req from website to our backend
// but we will configure it professionaly as below 
// cors() accepts an object as cors({}), where we can configure our cors or define options to cors
// if we use CORS_ORIGIN=* in our .env, it means we have allowed all the website to communicate to our backend
// assignemt (read about cors in npmjs.com)
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
    // we can add more option here too
}))

// as we recieve data to our backend from URL, or directly in json format or in json format in body after submitting a form
// so we have to prepare our backend to accept all those data that we recieve in our backend and specify a limit for recieving that data
// below we are the best practice that we can use for recieving data in our backend 

// below line means that we accept json format of data in our backend, which can be submit through a form from frontend to backend
// we can pass options as an object to json() where we can define the limit (you can use any limit) of data that we recive in our backend
// we had to use body-parser in our earlier version of express, but we dont need to use it now
app.use(express.json({ limit: "16kb"})) 

// we can recieve data to our backend from URL too
// we need to use urlencoded for encode special caracher of the data that we recieve through URL (as space will be encoded to %20)
// we can add "extended: true" option to urlencoded as urlencoded({extended: true}), which accept nested object inside object
// if we don't use extended object, we can avoid passing extended: true to urlencoded 
// we can pass limit here as well to urlencoded as below
app.use(express.urlencoded({extended: true, limit: "16kb"}))

// when we want to store file in our server in public folder, 
// and it will be accessable by any user, we can use below configuration, which is public assets
app.use(express.static("public"))

// cookie-parser is used to access and set cookies in user browser from server
// we can put and access secure cookies in user browser from sever only 
app.use(cookieParser())

// checking in the middle whether user is capable/allowed to access resources/data at the backend or not is called middleware
// we can have multiple middlware for multiple checks, middleware checks sequentially 
// in a controller we have four element as (err, req, res, next)
// req is used to get the request 
// res is used to send a response 
// next talkes about middleware, it is just a flag, 
// when the first middleware complete it Work, it passes a flag, to the next middleware indicating that i have done my Work
// hence to subsequent middleware 
// when all the middleware checkes completes, and the res is sent, then the flag gets discarded 


// routes (we have to import our routes here, as express needs your middleware to be loaded before your route declaration)
// route are import like this in the middle of app.js file, it get segregated
// we have to import it after the cookiePaser, urlencoded and others
import userRouter from "./routes/user.routes.js"

//routes import
import userRouter from './routes/user.routes.js'
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

// route declaration:
// to use the route we have to follow some good practice 
// as we were writing the app.get, we had route and contoller both in app.js, but we have route and controller separate 
// now we have to use the "use" middlware to bring the routes as below
// we can name the route anything, here we have used "/users"
// we want to activate the userRouter when we hit "/users" route
// we will add api/v1 at the starting of all routes in real world project as below 
// so our route on localhost will be like localhost:3000/api/v1/users 
app.use("/api/v1/users", userRouter)
// localhost:8000/api/v1/users will not Work, it will pass it to userRouter and find for other route inside userRouter

//routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)

// http://localhost:8000/api/v1/users/register

export { app }

// when an async method completes it return a promise 