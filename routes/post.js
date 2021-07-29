const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin  = require('../middleware/requireLogin')
const Post =  mongoose.model("Post")
const User = mongoose.model("User")
const moment = require('moment');



router.post('/createpost',requireLogin,(req,res)=>{
    const {title,body,photo} = req.body 
    if(!title || !body || !photo){
        req.flash('message','Please enter all fields'),
        res.redirect('/allpost')
    }
    req.user.password = undefined;

    const post = new Post({
        title,
        body,
        photo,
        postedBy:req.user
    })
    post.save().then(result=>{
        
        req.flash('message','Posted successfully'),
        res.redirect('/allpost');
    })
    .catch(err=>{
        console.log(err)
    })
})




router.get('/hello',requireLogin,(req,res)=>{
    res.render('chat.ejs', { userhi: JSON.stringify(req.user.name) ,user:req.user})
})



router.get('/allpost',requireLogin,(req,res)=>{
    
    Post.find()
    .populate("postedBy","_id name pic")
    .populate("comments.postedBy","_id name")
    .sort('-createdAt')
    .then((posts)=>{
        res.render('home.ejs',{message:req.flash('message'),posts:posts,user:req.user,moment:moment});
    }).catch(err=>{
        console.log(err)
    })
    
})

router.get('/getsubpost',requireLogin,(req,res)=>{

    // if postedBy in following
    Post.find({postedBy:{$in:req.user.following}})
    .populate("postedBy","_id name")
    .populate("comments.postedBy","_id name")
    .sort('-createdAt')
    .then(posts=>{
        res.render('ourpost.ejs',{message:req.flash('message'),posts:posts,moment:moment,user:req.user});
    })
    .catch(err=>{
        console.log(err)
    })
})

router.get('/mypost',requireLogin,(req,res)=>{
    Post.find({postedBy:req.user._id})
    .populate("postedBy","_id name")
    .then(mypost=>{
        res.render('myprofile.ejs',{message:req.flash('message'),mypost:mypost,user:req.user});
    })
    .catch(err=>{
        console.log(err)
    })
})

router.get('/:id',requireLogin,(req,res)=>{
   
    User.findOne({_id:req.params.id})
    .select("-password")
    .then(user=>{
    
         Post.find({postedBy:req.params.id})
         .populate("postedBy","_id name")
         .exec((err,posts)=>{
            
             if(err){
                 return res.status(422).json({error:err})
             }
             if(user._id.toString()===req.user._id.toString()){
                res.render('myprofile.ejs',{mypost:posts,user:user,me:req.user,message:req.flash('message')});
            }
            else{
                
                res.render('profile.ejs',{mypost:posts,they:user,user:req.user,message:req.flash('message')});
            }
            
         })
    }).catch(err=>{
        
        res.redirect("/allpost");
    })
})
















router.post('/like',requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.id,{
        $push:{likes:req.user._id}
    },{
        new:true
    }).exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            req.flash('message','Liked successfully'),
            res.redirect("/allpost");
        }
    })
})
router.put('/unlike',requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $pull:{likes:req.user._id}
    },{
        new:true
    }).exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            req.flash('message','Liked successfully'),
            res.redirect("/allpost");
        }
    })
})


router.post('/comment',requireLogin,(req,res)=>{
    const comment = {
        text:req.body.text,
        postedBy:req.user._id
    }
 
    Post.findByIdAndUpdate(req.body.idd,{
        $push:{comments:comment},
    },{
        new:true
    })
    .populate("comments.postedBy","_id name")
    .populate("postedBy","_id name")
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            req.flash('message','Commented successfully'),
            res.redirect("/allpost");
        }
    })
})

router.post('/deletepost/:postId',requireLogin,(req,res)=>{
    Post.findOne({_id:req.params.postId})
    .populate("postedBy","_id")
    .exec((err,post)=>{
        if(err || !post){
            return res.status(422).json({error:err})
        }
        if(post.postedBy._id.toString() === req.user._id.toString()){
              post.remove()
              .then(result=>{
                req.flash('message','Deleted Successfully'),
                res.redirect("/allpost");
              }).catch(err=>{
                  console.log(err)
              })
        }
        else{
            req.flash('message','You cannot delete the post of others'),
            res.redirect("/allpost");
        }
    })
})








module.exports=router