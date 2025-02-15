require("dotenv").config();
require("./config/dbConnect");
const express = require("express");
const session = require("express-session"); 
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const userRoute = require("./routes/users/users");
const postRoute = require("./routes/posts/posts");
const commentRoute = require("./routes/comments/comments");
const globalErrhandler = require("./middlewares/globalErrorHandler");
const Post = require("./models/post/Post");
const tranucatePost = require("./utils/helpers");
const app = express();
const port = process.env.PORT;

//config ejs
app.set("view engine","ejs");
//server static file
app.use(express.static(__dirname +"/public"));

//middleware

app.use(express.urlencoded({extended: true}));

//helpers js

app.locals.tranucate = tranucatePost;

/*method override "enctype is also used in form when method ovverride is use and
this use in form action path which is set after the action path ?_method=(method type/PUT/PATCH/DELETE)" 
example:- /api/v1/users/update?_method=PUT*/

app.use(methodOverride("_method"));

//session config

app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,  //false means it only save data in store when data is modified
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        ttl: 24 * 60 * 60,
        dbName: "fullstack-blog",
    })
}));


//save the login users into the locals 

app.use((req,res,next)=>{
    if(req.session.userAuth){
        res.locals.loginUser = req.session.userAuth;
    }else{
        res.locals.loginUser = null;
    }
    next();
});

//render home

app.get("/",async (req,res)=>{
   try {
    const posts = await Post.find().populate("user");
    res.render('index',{ posts });
   } catch (error) {
    return res.render("index",{ error: error.message });
   }
});


//----------
//user route
//----------


app.use("/api/v1/users",userRoute);

//----------
//post route
//----------

app.use("/api/v1",postRoute);

//--------
//comments
//--------


app.use("/api/v1",commentRoute);

//error handling middleware

app.use(globalErrhandler);

//server listen
app.listen(port,()=>{
    console.log(`Server started at ${port}`);
});

