const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message:{ 
            type: String,
            required: true
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Post",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Comment = mongoose.model("Comment",commentSchema);

module.exports = Comment;