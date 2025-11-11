// we will extend ApiError from Error class
// and override the constructor as below,
// where we will expect statusCode, message with default value as "Something went wrong", error array as empty, stack as empty value
class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    // we override below fields 
    super(message) 
    this.statusCode = statusCode 
    this.data = null
    this.message = message
    this.success =  false
    this.errors = errors

    // we can below production code, which is not required for us right now 
    // to properly show the issue in respeacted files  
    // to put all the error in stacktrace 
    if(stack){
        this.stack = stack
    } else {
        Error.captureStackTrace(this, this.constructor)
    }
  }
}

export { ApiError }

// as we have Error from Nodejs, but we don't have req and res class in Nodejs
// for req and res we use Express framework, Express does not give us something as Error class from Nodejs, but we can write our own class for req and res as ApiResponse.js in util folder to stramline the process