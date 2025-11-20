// this is our own created class
// we will create a constructor 
// and we will send data through this class

// we have to send statusCode, data, message = "Success" as response 
class ApiResponse {
    constructor(statusCode, data, message="Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export { ApiResponse }

// we have statusCode is server 
// informational is from 100 - 199
// successful is from 200 - 299
// Redirection is from 300 - 499
// Client error is from 400 - 499
// Server error is from 500 - 599

// above are good and standard practice, but we can send any status 

// we are using < 400 as success response 