const globalErrhandler = (err,req,res,next) => {
    const stack = err.stack;
    const message = err.message;
    const status = err.status;
    //if provide stastusCode otherwise it provide 500
    const statusCode = err.statusCode;

    //send status

    res.status(statusCode).json({
        status,
        message,
        stack
    });
};

//globalErrorHandler fetch the error which is send by appErr it fetch stack,message,status and statusCode and send it in the form of json format 

module.exports = globalErrhandler;
