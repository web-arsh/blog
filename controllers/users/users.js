const User = require("../../models/user/User");     
const bcrypt = require("bcrypt");
const appErr = require("../../utils/appErr");
const { extractPublicId } = require("cloudinary-build-url");
const cloudinary = require("cloudinary").v2;


//register

const registerCtrl = async (req,res,next)=>{
    const {fullname,email,password} = req.body;
    try {
        //check if fields are empty
        if(!fullname || !email || !password) return res.render("users/register",{ error: "All fields are empty"  });
        
        //1. check is user exist(email)
        const userFound = await User.findOne({email});
        //2.throw an error if user found
        if(userFound) return res.render("users/register",{ error: "Email already taken" });

        //3. Hash Password
        const salt = await bcrypt.genSaltSync(10);
        const hashPassword = await bcrypt.hashSync(password,salt);
        //register User
        const newFound = await User.create({
            fullname,
            email,
            password: hashPassword
        });
        //save the session
        req.session.userAuth = newFound._id;
        
        res.redirect("/api/v1/users/profile-page");
    } catch (error) {
        res.json(error);
    }
};

//login

const loginCtrl = async (req,res,next)=>{
    const {email,password} = req.body;
    try {
        //check if fields is empty
        if(!email || !password) return res.render("users/login",{ error: "Fields are empty" });

        //1. check if email exists
        const userFound =  await User.findOne({email});
        
        if(!userFound) return res.render("users/login",{ error: "Invalid user credentials"});
        
        //2. verify password
        const checkPassword = await bcrypt.compare(password,userFound.password);
        
        if(!checkPassword) return res.render("users/login",{ error: "Password Wrong" });
        
        //save the session
        req.session.userAuth = userFound._id; 
        res.redirect("/api/v1/users/profile-page");
    } catch (error) {
        res.json(error);
    }
};

//single user details
const userDetailCtrl = async (req,res)=>{
    try {
        //get the userID from params
        const userID = req.params.id;
        //find the user
        const user = await User.findById(userID);

        res.render("users/updateUser",{
            user,
            error:""
        });
    } catch (error) {
        res.json(error);
    }
};

//user profile

const userprofileCtrl = async (req,res)=>{
    try {
        //get the login user
        const userID = req.session.userAuth;
        //find the user
        const user = await User.findById(userID).populate("post").populate("comment");
        res.render("users/profile",{user});
    } catch (error) {
        res.json(error);
    }
};

//photo upload

const photouploadCtrl = async (req,res,next)=>{
    try {
        //check if no file if upload
        if(!req.file){
            return res.render("users/uploadProfilePhoto",{
                error: "No Image is uploaded"
            });
        };
        //find the user to be updated
        const userID = req.session.userAuth;
        const findUser = await User.findById(userID);
        //if user not found
        if(!findUser){
            return res.render("users/uploadProfilePhoto",{
                error: "User not found"
            });
        };
        //update profile photo  
        await User.findByIdAndUpdate(userID,{
            profileImage: req.file.path
        },{
            new: true
        });
         //if new file is uploaded then delete old one
         if(req.file && findUser.profileImage !== undefined){
            const public_id = extractPublicId(findUser.profileImage);
            cloudinary.uploader.destroy(public_id);
        };
        res.redirect("/api/v1/users/profile-page");
    } catch (error) {
        return res.render("users/uploadProfilePhoto",{
            error: error.message
        });
    }
};

//cover upload

const coveruploadCtrl = async (req,res,next)=>{
    try {
        //if no file is uploaded
        if(!req.file){
            return res.render("users/uploadCoverPhoto",{
                error: "No Image is uploaded"
            });
        };
        
        //find the user to be updated
        const userId = req.session.userAuth;
        const findUser = await User.findById(userId);
        //if user not found
        if(!findUser){
            res.render("users/uploadCoverPhoto",{
                error: "User not found"
            });
        };
        //update cover photo
        await User.findByIdAndUpdate(userId,{
            coverImage: req.file.path,
        },{
            new: true
        });
         //if new file is uploaded then delete old one
         if(req.file && findUser.coverImage !== undefined){
            const public_id = extractPublicId(findUser.coverImage);
            cloudinary.uploader.destroy(public_id);
        }
        res.redirect("/api/v1/users/profile-page")
    } catch (error) {
        return next(appErr(error.message));
    }
};

//update password

const updatepasswordCtrl = async (req,res,next)=>{
    const {password} = req.body;
    if(!password) return res.render("users/updatePassword",{error: "Field empty"})
    try {
        //check if user is provide password which is already taken
        if(password){
            const userFound = await User.findById(req.session.userAuth);
            const comparePassword = await bcrypt.compare(password,userFound.password);
            if (comparePassword) return res.render("users/updatePassword",{error:"Password already taken"});
        }
        //update password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password,salt);
        
        await User.findByIdAndUpdate(req.session.userAuth,{
            password: hashPassword
        },{
            new: true
        });
        res.redirect("/api/v1/users/profile-page");
    } catch (error) {
        return res.render("users/updatePassword",{error: error.message});
    }
};

const userupdateCtrl = async (req,res,next)=>{
    const {fullname,email} = req.body;
    
    try {
        //if fields are empty
        if(!email || !fullname) return res.render("users/updateUser",{ error:"Fields are empty" ,user: "" });
        
        
        //check if email and name is not taken
        
        const emailTaken = await User.findOne({email});
        if (emailTaken) return res.render("users/updateUser",{ error: "Email already taken", user: ""});
        
        const nameTaken = await User.findOne({fullname});
        if (nameTaken) return res.render("users/updateUser",{ error: "Name already taken", user: "" });
        

        //update the user
        await User.findByIdAndUpdate(req.session.userAuth,{
            fullname,
            email
        },{
            new: true
        });
        res.redirect("/api/v1/users/profile-page");
    } catch (error) {
        return next(appErr(error.message));
    }
};

const logout = async (req,res)=>{
    req.session.destroy(()=>{
        res.redirect("/api/v1/users/login");
    });
};

module.exports = {
    registerCtrl,
    loginCtrl,
    userDetailCtrl,
    userprofileCtrl,
    photouploadCtrl,
    coveruploadCtrl,
    updatepasswordCtrl,
    userupdateCtrl,
    logout
};