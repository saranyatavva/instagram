const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const requireLogin  = require('../middleware/requireLogin')
const Post =  mongoose.model("Post")
const User = mongoose.model("User")

router.post('/edit',requireLogin,(req,res)=>{
    
      User.findByIdAndUpdate(req.user._id).then(user=>{
       
        user.pic=req.body.photo;
        user.bio=req.body.bio;
        user.save()
        res.redirect("/myprofile");
          
      }).catch(err=>{
          return res.status(422).json({error:err})
      })

    
    
})


router.post('/follow',requireLogin,(req,res)=>{
    User.findByIdAndUpdate(req.body.followId,{
        $push:{followers:req.user._id}
    },{
        new:true
    },(err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }
      User.findByIdAndUpdate(req.user._id,{
          $push:{following:req.body.followId}
          
      },{new:true}).then(result=>{
       
        req.flash('message','Followed successfully'),
        res.redirect('/:followId')
          
      }).catch(err=>{
          return res.status(422).json({error:err})
      })

    }
    )
})
router.post('/unfollow',requireLogin,(req,res)=>{
    User.findByIdAndUpdate(req.body.unfollowId,{
        $pull:{followers:req.user._id}
    },{
        new:true
    },(err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }
      User.findByIdAndUpdate(req.user._id,{
          $pull:{following:req.body.unfollowId}
          
      },{new:true}).select("-password").then(result=>{
        
        console.log(result)
      }).catch(err=>{
          return res.status(422).json({error:err})
      })

    }
    )
})


router.put('/updatepic',requireLogin,(req,res)=>{
    User.findByIdAndUpdate(req.user._id,{$set:{pic:req.body.pic}},{new:true},
        (err,result)=>{
         if(err){
             return res.status(422).json({error:"pic canot post"})
         }
         res.json(result)
    })
})



router.post('/search-users',(req,res)=>{
    
    let userPattern = new RegExp("^"+req.body.search)
    {
        let hint = "";
        
       
        User.find({name:{$regex:userPattern}})
    .select("_id name pic")
    .then(users=>{
        
        users.forEach(function(sResult){

            
                if(hint === ""){
                    hint="<a href='' target='_blank'>" + sResult.name + "</a>";
                }else{
                    hint = hint + "<br /><a href='' target='_blank'>" + sResult.name + "</a>";
                    filterNum++;
                }
            
        })
    })
    if(hint === ""){
            response = "no suggestion"
        }else{
            response = hint;
        }

        console.log(response);
    
        res.send({response: response});
 

    
}})



module.exports = router