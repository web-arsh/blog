const Post = require("../../models/post/Post");
const User = require("../../models/user/User");
const Comment = require("../../models/comment/Comment");
const appErr = require("../../utils/appErr");

//comment create

const createcommentCtrl = async (req,res,next)=>{
    const {message} = req.body;
    try {
        //create comment
        const comment = await Comment.create({
            message,
            user: req.session.userAuth,
            post: req.params.id
        });
        //push the comment to post
        await Post.findByIdAndUpdate(req.params.id,{
            $push: {comments: comment._id}
        });
        //push the comment to the user
        await User.findByIdAndUpdate(req.session.userAuth,{
            $push:{comment: comment._id}
        });
        res.redirect(`/api/v1/posts/${req.params.id}`);
    } catch (error) {
        next(appErr(error.message));
    }
};

//single comment

const singlecommentCtrl = async (req,res,next)=>{
    try {
        const findComment = await Comment.findById(req.params.id);
        res.render("comments/updateComment",{
            error: "",
            findComment,
        });

    } catch (error) {
        res.render("comments/updateComment",{
            error: error.message    ,
            findComment
        });
    }
};

//delete comment

const deletecommentCtrl = async (req,res,next)=>{
    try {
        //find the comment
        const comment = await Comment.findById(req.params.id).populate("user");
        //check if comment belongs to user
        if(comment.user._id.toString() !== req.session.userAuth) return next(appErr("You are not allowed to delte this comment"));
        //delete the comment
        await Comment.findByIdAndDelete(req.params.id);

        //------------------------------------------------------------------------
        //this line of code is used to remove comment id in post and user comments
        //------------------------------------------------------------------------

        await Post.updateOne({comments: req.params.id},{
        $pull:  {comments: req.params.id}
        });
        await User.updateOne({comment: req.params.id},{
        $pull: {comment: req.params.id}
        });
        
        //-----------------------------------------------------------------------------
        //-------------------------------------END-------------------------------------
        //-----------------------------------------------------------------------------
        res.redirect(`/api/v1/posts/${req.query.postId}`);
        
    } catch (error) {
        next(appErr(error.message));
    }
};

//update comment

const updatecommentCtrl = async (req,res,next)=>{
    try {
        //find the comment 
        const comment = await Comment.findById(req.params.id);
        //check if comment belongs to user
        if(comment.user.toString() !== req.session.userAuth) return res.render("user/commentUpdate",{error:"Your are not allowed to update this comment"});

        //update the comment
        const updateComment = await Comment.findByIdAndUpdate(req.params.id,{
            message: req.body.message
        },{
            new: true
        });

        res.redirect(`/api/v1/posts/${req.query.postId}`);
    } catch (error) {
        res.render("comments/updateComment",{
            error: error.message
        })
    }
};

module.exports = {
    createcommentCtrl,
    singlecommentCtrl,
    deletecommentCtrl,
    updatecommentCtrl
};