import mongoose from 'mongoose';

const embeddingSchema = new mongoose.Schema({
    meetingId : {
        type:mongoose.Schema.Types.ObjectId,
        ref : "meeting",
        required : true,
    },
    chunkIndex :{
        type : Number,
        required : true,
    },
    text : {
        type : String,
        required : true,
    },
    embedding : {
        type : [Number],
        required : true,
    },
    startTime : {
        type : Date,
        required : true,
    },
    endTime : {
        type : Date,
        required : true,
    },
})
export default mongoose.model("embedding",embeddingSchema);