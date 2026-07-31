import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    date: {
        type: String,
    },
    time: String,
    status: {
        type: String,
        default: "scheduled",
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
},{
    timestamps:true,
});

const meetingModel = mongoose.model("Meeting", meetingSchema);
export default meetingModel;