import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import cors from 'cors';
import clientRoutes from './routes/client.routes.js';
import meetingRoutes from './routes/meeting.routes.js'
import livekitRoutes from './routes/livekit.routes.js';




dotenv.config();

const app = express();


app.use(express.json());
app.use(cors());
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


app.use('/api/auth',authRoutes);
app.use('/api/clients',clientRoutes);
app.use('/api/meetings',meetingRoutes);
app.use('/api/livekit',livekitRoutes);

app.listen(PORT,()=>{
    console.log(`Server running on Port ${PORT}`);
});