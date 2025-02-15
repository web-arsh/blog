const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        title:{
            type: String,
            required: true
        },
        description:{
            type: String,
            required: true
        },
        category:{
            type: String,
            required: true,
            enum: ["Web Development","Tech Gadgets","Business","Health & Wellness"]
        },
        image:{
            type: String,
            required: true
        },
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true
        },
        role:{
            type: String,
            default: "Blogger"
        },
        bio:{
            type: String,
            default: "Lorem ipsum dolor, sit amet consectetur adipisicing elit."
        },
        // A post has many comments so thats why we use array 
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment"
            }
        ]
    },
    {
        timestamps: true
    }
);

const Post = mongoose.model("Post",postSchema);
module.exports = Post;  