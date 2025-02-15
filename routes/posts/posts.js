const express = require("express");
const { createpostCtrl, allpostCtrl, singlepostCtrl, deletepostCtrl, updatepostCtrl } = require("../../controllers/posts/post");
const postRoute = express.Router();
const protected = require("../../middlewares/protected");
const multer = require("multer");
const storage = require("../../config/cloudinary");
const Post = require("../../models/post/Post");

//instance of multer

const upload = multer({
    storage: storage,
    fileFilter: (req,file,cb) => {
        if(file.originalname.endsWith("jpeg") || file.originalname.endsWith("jpg") || file.originalname.endsWith("png")) cb(null,true);
        else cb("File must be in (.jpeg,jpg & .png",false);
    },
});

postRoute.get("/get-post-form",protected,(req,res)=>{
    res.render("posts/addPost",{ error:"" });
});

postRoute.get("/update-post/:id",async (req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        res.render("posts/updatePost",{
            error:null,
            post
        });
    } catch (error) {
        res.render("posts/updatePost",{
            post: "",
            error: error.message
        });
    }
});

//POSt/posts
postRoute.post("/posts",upload.single("post-image"),protected,createpostCtrl);


//GET/posts
postRoute.get("/posts",allpostCtrl);


//GET/posts/:id
postRoute.get("/posts/:id",singlepostCtrl);


//DELETE/posts
postRoute.delete("/posts/:id",protected,deletepostCtrl);


//PUT/posts
postRoute.put("/posts/:id",upload.single("post-image"),protected,updatepostCtrl);



module.exports = postRoute;