const appErr = (message,statusCode)=>{
    let error = new Error(message);
    error.stack = error.stack;
    error.status = error.status ? error.status : "failed!";
    error.statusCode = statusCode ? statusCode : 500;
    return error;
}

//appErr return error to globalErrorHandle middleware

module.exports = appErr;