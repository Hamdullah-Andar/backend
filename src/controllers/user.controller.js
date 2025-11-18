// working on more controller on real world projects ends with logic building

// some people build logic using leedcode problem

// some other build logic while doing DSA

// we have to divide a big problem, in small part, and try to solve each part at a time

// 70% - 80% people build logic using real world project

// Example
// we have to register a user,
// as register a user is the problem,
// we have to divide it in small parts, and try to solve each part at a time

// as we have asyncHandler, we will use it

import { asyncHandler } from "../utils/asyncHandler.js";

// asyncHandler is a higher order function which accept another function
// as we know that when we write a method through express we have access to error, req, res, next
const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "ok response",
    });
    // above we have send a json response
});

export { registerUser }
// we have to create a route when to run above controller 
