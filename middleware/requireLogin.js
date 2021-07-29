const jwt = require('jsonwebtoken')
const {secret} =require('../key');
const mongoose = require('mongoose')
const User = mongoose.model("User")
module.exports = (req,res,next)=>{
    const token = req.cookies.jwt
    //authorization === Bearer ewefwegwrherhe
    if(!token){
        req.flash('message','You must be Logged In')
        res.redirect('/')
    }
    else{
    jwt.verify(token,secret,(err,payload)=>{
        if(err){
            req.flash('message','You must be Logged In')
            res.redirect('/')
        }
        else{

        const {_id} = payload
        User.findById(_id).then(userdata=>{
            req.user = userdata;
            req.token=token;
            next()   
        })
        
    }
    })
}
}
 