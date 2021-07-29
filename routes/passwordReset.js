const mongoose = require('mongoose')
const User = mongoose.model("User")
const Token = require("../models/token");
const sendEmail = require("../utils/sendEmail");
const bcrypt=require('bcryptjs')
const crypto = require("crypto");
const Joi = require("joi");
const express = require("express");
const router = express.Router();

router.post("/password-reset", async (req, res) => {
    try {
        const schema = Joi.object({ email: Joi.string().email().required() });
        const { error } = schema.validate(req.body);
        if (error) {
            
             req.flash('message',error.details[0].message),
            res.redirect('/password')
            return

        }
        const user = await User.findOne({ email: req.body.email });
        if (!user)
            {
            
             req.flash('message','User doesnt exist with this email ID'),
             res.redirect('/password')
             return
            }

        let token = await Token.findOne({ userId: user._id });
        if (!token) {
            token = await new Token({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();
        }

        const link = `http://localhost:7000/password-reset/${user._id}/${token.token}`;
        await sendEmail(user.email, "Password reset", link);
        req.flash('message','Password reset link sent to your Email ID'),
        res.redirect('/password')
       
    } catch (error) {
        req.flash('message',error),
        res.redirect('/password')
        
    }
});



router.post("/password-reset/:userId/:token", async (req, res) => {
    try {
        const schema = Joi.object({ password: Joi.string().required() });
        const { error } = schema.validate(req.body);
        if (error) {
            req.flash('message',error.details[0].message),
            res.redirect('/password-reset/:userId/:token')
            return
        }

        const user = await User.findById(req.params.userId);
        if (!user) {
            req.flash('message','Invalid link or expired'),
            res.redirect('/password-reset/:userId/:token')
            return
        }

        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token,
        });
        if (!token) {
            req.flash('message','Invalid link or expired'),
            res.redirect('/password-reset/:userId/:token')
            return
        }
         
        
        await token.delete();
         await bcrypt.hash(req.body.password,12)
        .then(hashedPassword=>{
         
             user.password=hashedPassword;
             
  
         })

         await user.save();
        
        req.flash('message','Password Saved Successfully'),
        res.redirect('/')
        
    } catch (error) {
        req.flash('message',error),
        res.redirect('/password-reset/:userId/:token')
    }
});

module.exports = router;