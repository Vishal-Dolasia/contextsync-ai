import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import clientModel from '../models/client.model.js'

const router = express.Router();


router.post("/",authMiddleware,async (req,res)=>{
    const {name,email,phone,company,notes} = req.body;

    const owner = req.user.id;

    try{
        const client = await clientModel.create({
            name,
            email,
            phone,
            company,
            notes,
            owner
        })
        res.status(201).json({
            message:"client created successfully",
            client : client,
        })
    }catch(err){
        console.log(err);
        res.status(500).json({
            message:"Server error"
        })
    }


})

router.get("/",authMiddleware,async(req,res)=>{
    
    try{
        const owner = req.user.id;
        const data = await clientModel.find({
            owner : owner
        });
        res.status(200).json({
            message:"Collected all the data",
            data : data
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            message: "Server error"
        });
    }

})

export default router;