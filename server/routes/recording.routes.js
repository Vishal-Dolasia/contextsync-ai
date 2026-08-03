import express from 'express';
import { EgressClient } from 'livekit-server-sdk';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

const egressClient = new EgressClient(process.env.LIVEKIT_URL,process.env.LIVEKIT_API_KEY,process.env.LIVEKIT_API_SECRET)

router.post('/start',authMiddleware,async (req,res)=>{
    try{
        const {roomName} = req.body;
        if(!roomName){
            return res.status(400).json({
                "message": "Roomname missing",
            })
        }
        else{
            egressClient.startTrackCompositeEgress
        }
    }catch(err){

    }
})


export default router;