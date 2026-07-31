import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import clientModel from '../models/client.model.js'
import mongoose from 'mongoose';

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
        const query = req.query.search;
        const sort = req.query.sort;
        let data;
        let sortOption = {};

        if (sort === "az") {
        sortOption = { name: 1 };
        } else if (sort === "za") {
        sortOption = { name: -1 };
        } else if (sort === "newest") {
        sortOption = { createdAt: -1 };
        } else if (sort === "oldest") {
        sortOption = { createdAt: 1 };
        }
        if(!query){
            data = await clientModel.find({
                owner : owner
            }).sort(sortOption);
        }
        else{
            data = await clientModel.find({
                owner,
                $or:[
                    {name : {
                        $regex : query,
                        $options : "i",
                    }},
                    {email : {
                        $regex : query,
                        $options : "i",
                    }},
                    {company : {
                        $regex : query,
                        $options : "i",
                    }},
                ]
            }).sort(sortOption);
        }
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


router.get("/:id",authMiddleware,async(req,res)=>{
    const clientId = req.params.id;
    const owner = req.user.id;

    try{
        const client = await clientModel.findOne({
            _id : clientId,
            owner : owner
        })
        if(client === null){
            return res.status(404).json({
                message: "Client not found"
            });
        }
        else{
            return res.status(200).json({
                message: "Client found",
                client: client
            });
        }
    }catch(err){
        res.status(400).json({
            message:"Some error"
        })
    }
})


router.patch("/:id",authMiddleware,async(req,res)=>{
    const clientId = req.params.id;
    const owner = req.user.id;
    const {
        name,
        email,
        phone,
        company,
        notes
    } = req.body;

    try{
        const client = await clientModel.findOneAndUpdate({
            _id : clientId,
            owner : owner,
        },{
            $set :{
                name,
                email,
                phone,
                company,
                notes,
            }
        },{
            new :true,
        })
        if(client === null){
            return res.status(404).json({
                message:"Client was not found",
            })
        }
        return res.status(200).json({
            message : "Client updated successfully",
            client
        })
    }catch(err){
        return res.status(500).json({
            message:"Server error",
        })
    }

})


router.delete("/:id",authMiddleware,async (req,res)=>{
    const clientId = req.params.id;
    const owner = req.user.id;
    try{
        const client = await clientModel.findOneAndDelete({
            _id:clientId,
            owner
        })

        if(client){
            return res.status(200).json({
                message:"Client deleted successfully",
            })
        }else{
            return res.status(404).json({
                message:"Client was not found",
            })
        }
    }catch(err){
        return res.status(500).json({
            message:"Server error",
        })
    }

})
export default router;