const { extractPublicId } = require("cloudinary-build-url");
const Post = require("../../models/post/Post");
const Comment = require("../../models/comment/Comment");
const User = require("../../models/user/User");
const appErr = require("../../utils/appErr");
const cloudinary = require("cloudinary").v2;

//create post 
const createpostCtrl = async (req,res,next)=>{
    const { title, description, category } = req.body;
    try {
        //check if fields are empty
        if(!title || !description || !category || !req.file) return res.render("posts/addPost",{error: "fields are empty"});

        //find the user 
        const userID = req.session.userAuth;
        
        const userFound = await User.findById(userID);
        //create post
        const postCreate = await Post.create({
            title,
            description,
            category,
            image: req.file.path,
            user: userFound._id
        });
        
        //push the post created into the array of user's post
        await User.findByIdAndUpdate(userFound._id,{
            $push: {post: postCreate._id}
        });
        res.redirect("/api/v1/users/profile-page");
    } catch (error) {
        return res.render("posts/addPost",{error: error.message});
    }
};

//fetch all post

const allpostCtrl = async (req,res,next)=>{
    try {
        const post = await Post.find().populate("comments").populate("user");
        res.json({
            status: "success",
            data: post
        });
    } catch (error) {
        next(appErr(error.message));
    }
};

//fetch single post

const singlepostCtrl = async (req,res,next)=>{
    try {
        //get the id from params
        const id = req.params.id;
        //find the post 
        const post = await Post.findById(id).populate({
            path: "comments",
            populate: {
                path: "user"
            }
        }).populate("user");
        res.render("posts/postDetails",{
            post,
            error:""
        });
    } catch (error) {
        next(appErr(error.message));    
    }
};

//delete post

const deletepostCtrl = async (req,res,next)=>{
    try {
        const post = await Post.findById(req.params.id,{
            comments: 1,_id:0
        });
        
        const postImage = Post.findById(req.params.id); 

        //delete comment
        await Comment.deleteMany({_id: {$in: post.comments}});
        //if post is deleted then remove post id and comments from user post and comment
        await User.updateOne({post: req.params.id},{
            $pull: {
                post: req.params.id,
                comment: {$in: post.comments}
            },
        });
        //find thew post 
        const deletePost = await Post.findById(req.params.id);
        //check if post belongs to the user
        if (deletePost.user.toString() !== req.session.userAuth.toString()){
            return res.render("posts/postDetails",{
                error: "You are not authorize to delete this post",
                post:""
            });
        }
        //delete post 
        await Post.findByIdAndDelete(req.params.id);
        res.redirect("/api/v1/users/profile-page");
    } catch (error) {
         return res.render("posts/postDetails",{
            error: error.message,
            post: ""
        });
    }
};

//update post

const updatepostCtrl = async (req,res,next)=>{
    const {title,description,category} = req.body;
    //check if fields are empty
    if(!title && !description && !category && !req.file) return next(appErr("All fields are empty"));
    
    try {
        //find user post
        const post = await Post.findById(req.params.id);
        
        //check if file is present or not if present then update the file path otherwise add previous path

        const image = req.file ? req.file.path : post.image;
        
        //if new file is uploaded then delete old one
        if(req.file){
            const public_id = extractPublicId(post.image);
            cloudinary.uploader.destroy(public_id);
        }

        //check if post belongs to user
        if(post.user.toString() !== req.session.userAuth) return next(appErr("You are not allowed to delete this post."));
        
        await Post.findByIdAndUpdate(req.params.id,{
            title,
            description,
            category,
            image
        },{
            new: true
        });
        
        res.redirect(`/api/v1/posts/${req.params.id}`);

    } catch (error) {
        return next(appErr(error.message));
    }
};

module.exports = {
    createpostCtrl,
    allpostCtrl,
    singlepostCtrl,
    deletepostCtrl,
    updatepostCtrl    
};
