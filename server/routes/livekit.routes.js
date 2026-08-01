import express from 'express';
import {AccessToken} from 'livekit-server-sdk';
import dotenv from 'dotenv';
import userModel from '../models/user.model.js';
import authMiddleware from '../middleware/auth.middleware.js';


const router = express.Router();

router.post('/token',authMiddleware,async (req,res)=>{
    try{
        const {roomName} = req.body;
        if(!roomName){
            return res.status(400).json({
                message:"Room name is required."
            });
        }


        const owner = req.user.id
        const user = await userModel.findById(owner);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }  
        const token = new AccessToken(process.env.LIVEKIT_API_KEY,process.env.LIVEKIT_API_SECRET,{
            identity: user._id.toString()
        });
        token.metadata = JSON.stringify({
            name: user.name,
            email: user.email,
        });

        token.addGrant({
            room : roomName,
            roomJoin : true,
        })
        const jwt = await token.toJwt();
        return res.status(200).json({
            message:"Token generated successfully",
            token : jwt,
            url : process.env.LIVEKIT_URL,
        })
    }catch(err){
        return res.status(500).json({
            message:`error: ${err.message}`,
        })
    }
})


export default router;