import express from 'express';
import bcryptjs from 'bcryptjs';
import UserModel from '../models/user.model.js'
import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import authMiddleware from '../middleware/auth.middleware.js';

dotenv.config();

const router = express.Router();


router.post('/register',async (req,res)=>{
    const {name,email,password,role} = req.body;

    const email_present = await UserModel.findOne({email});
    if(email_present){
        return res.status(400).json({
            "message" : "email already exists"
        })
    }

    try{

        const salt = await bcryptjs.genSalt(10);
        const hash_password = await bcryptjs.hash(password,salt);

        await UserModel.create({
            name:name,
            email:email,
            passwordHash:hash_password,
            role:role,
        });

        console.log("data stored successfully");
        res.status(201).json({ message: "User registered successfully" });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ message: `Server error :${err} `});
    }
})



router.post('/login', async (req, res) => {
    const {email, password} = req.body;

    const email_present = await UserModel.findOne({email});
    if(!email_present){
        return res.status(400).json({
            "message" : "Invalid credentials"
        })
    }
    const correct_password = await bcryptjs.compare(password,email_present.passwordHash);

    if(correct_password){
        const token = jwt.sign(
            {
                id : email_present._id,
                role : email_present.role
            },
                process.env.JWT_SECRET,
            {
                expiresIn : '7d'
            }
        )
        return res.status(201).json({
            message : "Login successfully",
            token: token,
        })
    }
    else{
        return res.status(400).json({
            message : "Invalid credentials",
        })
    }
});



router.get("/me", authMiddleware, (req, res) => {
    return res.status(200).json({
        message: "Authorized",
        user: req.user,
    });
});
export default router;