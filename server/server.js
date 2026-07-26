import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();


app.use(express.json());

const PORT =process.env.PORT || 5000;

async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    
    }catch(err){
        console.log('MongoDB connection error:', err);
    }
}
connectDB();


app.get('/api/health', (req,res)=>{
    res.json({status:'ok',message:'Server is running'});
});


app.listen(PORT,()=>{
    console.log(`Server running on Port ${PORT}`);
});