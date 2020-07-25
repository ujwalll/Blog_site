const express = require("express"),
	methodoverride = require("method-override"),  
	expsanitize = require("express-sanitizer"),  
	app=express(),
	mongoose = require("mongoose"),
	bodyParser = require("body-parser");

mongoose.connect('mongodb://localhost:27017/blog_site', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
	useFindAndModify:false
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

//App config
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodoverride("_method"));
app.use(expsanitize());
//Mongoose config
var blogSchema = new mongoose.Schema({
	title:String,
	image:String,
	body:String,
	created:{type:Date, default:Date.now}
});

var Blog = mongoose.model("Blog",blogSchema);

// Blog.create({
// 	title:"Test Blog",
// 	image:"https://images.unsplash.com/photo-1530032582480-edd739014c39?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=671&q=80",
// 	body:"My heart goes up with this tea going up!"
// });


//Routes
app.get("/",function(req,res){
	res.redirect("/blogs");
})

//Index route
app.get("/blogs",function(req,res){
	Blog.find({},function(err,blogs){
		if(err){
			console.log(err);
		}
		else{
			res.render("index",{blogs:blogs});
		}
	})
})

//create
app.post("/blogs",function(req,res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog,function(err,newblog){
		if(err){
			res.render("new");
		}
		else{
			res.redirect("/blogs");
		}
	})
})

//new route
app.get("/blogs/new",function(req,res){
	res.render("new");
})

//show
app.get("/blogs/:id",function(req,res){
	Blog.findById(req.params.id,function(err,foundBlog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.render("show",{blog:foundBlog});
		}
	})
});

//Edit route
app.get("/blogs/:id/edit",function(req,res){
	Blog.findById(req.params.id,function(err,foundBlog){
		if(err){
			res.redirect("/blogs");
		}
		else {
			res.render("edit",{blog:foundBlog});
		}
	})
});

//update route
app.put("/blogs/:id",function(req,res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedblog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.redirect("/blogs/" + req.params.id);
		}
	})
})

//delete route
app.delete("/blogs/:id",function(req,res){
	Blog.findByIdAndRemove(req.params.id,function(err){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.redirect("/blogs");
		}
	})
})

app.listen(3000,function(){
	console.log("Blog site is up!");
})
	  