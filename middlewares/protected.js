const appErr = require("../utils/appErr");

const protected = (req,res,next) => {
    //check if user is login
    if(req.session.userAuth) return next();
    else return res.render("users/notAuthorize");
};

module.exports = protected;