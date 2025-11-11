// asynHandler create a method and export it
// we can use try catch or promise .then .catch for handling asyncHandler
// we will use promise here

// we can name the passed function as fn or anything else, but we will it as requestHandler. it is more readable and meaningfull
// and we can return the requestHandler execution directly as below
// we will create a Promise and in .resolve section we will call the requestHandler and in .catch section will display error
const asyncHandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

// as we have standerize the api response, we will standerize api error also in ApiError.js in util folder
// we can read more about nodejs error class in nodejs documentation 

export { asyncHandler };

// higher order function is a function which take a function as a parameter or return a function
// Higher order function treats a function as a variable
// below is it's example

// const asyncHandler = () => {} // arrow function
// const asyncHandler = (func) => {} // passing a function to arrow function, as we need to run the func, we can not do it in the current arrow function, we can write it as another arrow function as below
// const asyncHandler = (func) => {return () => {}} // passing func and running it as another arrow function inside a asyncHandler arrow function, but we have to use "(func) => {return () => {}} or remove {} as (func) => () => {}
// const asyncHandler = (func) => (() => {}) // while using {} for func arrow functio we have to used return key, or we have to put our func inside a pair of ()
// const asyncHandler = (func) => async () => {} // remove the {} from func arrow function and making it as async function

// to run the async function, we need to extract req, res, next, we can extract error too, if we want
// we will put everything in try catch inside async function
// inside the catch section we will send status, inside status we send error code or 500, in Json response we can send success flag as false send error message in it as err.message
// inside the try section we will run th fn as fn(req, res, next) and make it await as we have async function
// it was try catch type of asyncHandler, we can do it using promise too as above
// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }
