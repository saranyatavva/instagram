const express = require('express');
const router=express.Router()
const mongoose = require('mongoose');
const User=mongoose.model("User")
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const {secret} =require('../key');
const requireLogin=require('../middleware/requireLogin');
const { request, response } = require('express');





router.get("/password-reset/:userId/:token", (req, res) => {
    res.render('enter.ejs',{message:req.flash('message')});
})
router.get("/password", (req, res) => {
    res.render('reset.ejs',{message:req.flash('message')});
})





router.get('/signup',function(req,res){
    
    res.render('signup.ejs',{message:req.flash('message')});

});
router.get('/',function(req,res){
    
    res.render('signin.ejs',{message:req.flash('message')});

});


router.post('/signup',(req, res) => {
    const {name,email,password}= req.body;
    if(!email || !password || !name)
    {
         req.flash('message','Please enter all fields')
         res.status(411)
         res.redirect('/signup')
    }
    else{
    User.findOne({email:email}).then((savedUser)=>{
       if(savedUser){
        req.flash('message','User already exists!')
        res.status(411)
        res.redirect('/signup')
       }
       else{
       bcrypt.hash(password,12)
       .then(hashedPassword=>{
        const user=new User({
            email,
            password:hashedPassword,
            name
 
        })
        user.save().then(user=>
        res.redirect('/'))
       .catch(err=>{console.log(err)})

       })}
       
       
    })
    .catch(err=>{console.log(err)})}
})
router.post('/',(req,res)=>{
    const {email,password} = req.body
    if(!email || !password){
        req.flash('message','Enter all fields!')
        res.redirect('/')
    }
    else{
    User.findOne({email:email})
    .then(savedUser=>{
        if(!savedUser){
            req.flash('message','Invalid Email or password!')
            res.redirect('/')
        }
        else{
           
        bcrypt.compare(password,savedUser.password) 
        .then(doMatch=>{
            if(doMatch){
               const token = jwt.sign({_id:savedUser._id},secret);
               const {_id,name,email}=savedUser;

               console.log({token,user:{_id,name,email}});
               res.cookie('jwt',token,{expires:new Date(Date.now()+6000000),httpOnly:true});
               
               req.flash('message','Sucessfully loggedIn')
               res.redirect('/allpost')
            }
            else{
                req.flash('message','Invalid Email or password!'),
                res.redirect('/')
            }
        })
        .catch(err=>{
            console.log(err)
        })}
    })}
})
router.get("/logout", requireLogin, (req, res) => {
    console.log(req.user);
    res.clearCookie("jwt");
    req.flash('message','Logged out Sucessfully'),
    req.user.save();
    res.redirect("/");
  });









module.exports=router