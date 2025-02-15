const express = require("express");
const { registerCtrl, loginCtrl, userDetailCtrl, userprofileCtrl, photouploadCtrl, coveruploadCtrl, updatepasswordCtrl, userupdateCtrl, logout } = require("../../controllers/users/users");

const userRoute = express.Router();
const protected = require("../../middlewares/protected");
const multer = require("multer");
const storage = require("../../config/cloudinary");

//instance of multer
const upload = multer({
    storage: storage,
    fileFilter: (req,file,cb)=>{
        if(file.originalname.endsWith("jpeg") || file.originalname.endsWith("jpg") || file.originalname.endsWith("png")) cb(null,true);
        else cb('File must be in (.jpg,.jpeg & png format)',false);
    }
});

//--------
//Rendering Forms
//--------

//login form
userRoute.get("/login",(req,res)=>{
    res.render("users/login",{
        error:""
    });
});

//register form

userRoute.get("/register",(req,res)=>{
    res.render("users/register",{
        error: ""
    })
});

//upload profile photo

userRoute.get("/upload-profile-photo-form",protected,(req,res)=>{
        res.render("users/uploadProfilePhoto",{
        error: ""
    })
});

//upload cover photo

userRoute.get("/upload-cover-photo-form",protected,(req,res)=>{
    res.render("users/uploadCoverPhoto",{
        error:""
    })
});

//update user form

userRoute.get("/update-user-password",protected,(req,res)=>{
    res.render("users/updatePassword",{error: ""});
});

//POSt/api/v1/users/register
userRoute.post("/register",registerCtrl);

//POST/api/v1/users/login   
userRoute.post("/login",loginCtrl);

//GET/profile   
userRoute.get("/profile-page",protected,userprofileCtrl);


//PUT/profile-photo-upload   
userRoute.put("/profile-photo-upload",protected,upload.single("profile"),photouploadCtrl);



//PUT/cover-photo-upload   
userRoute.put("/cover-photo-upload",protected,upload.single("cover-image"),coveruploadCtrl);



//PUT/update-password
userRoute.put("/update-password",protected,updatepasswordCtrl);

//PUT/update  
userRoute.put("/update",protected,userupdateCtrl);


//GET/logout
userRoute.get("/logout",logout);

//GET  
userRoute.get("/:id",userDetailCtrl);

module.exports = userRoute;