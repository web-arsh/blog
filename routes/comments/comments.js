const express = require("express");
const { createcommentCtrl, singlecommentCtrl, deletecommentCtrl, updatecommentCtrl } = require("../../controllers/comments/comments");
const commentRoute = express.Router();
const protected = require("../../middlewares/protected");

//GET/comments/:id
commentRoute.get("/comments/:id",singlecommentCtrl);

//POSt/api/v1/comments

commentRoute.post("/comments/:id",protected,createcommentCtrl);

//DELETE/comments
commentRoute.delete("/comments/:id",protected,deletecommentCtrl);

//PUT/comments
commentRoute.put("/comments/:id",protected,updatecommentCtrl);


module.exports = commentRoute;