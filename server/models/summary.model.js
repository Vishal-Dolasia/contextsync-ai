import mongoose, { Types } from 'mongoose';

const summarySchema = new mongoose.Schema(
    {
        "meetingId" : {
            type: String,
            required : true,
        },
        summary: {
            type: String,
            default: "",
        },

        actionItems: [
            {
                type: String,
            },
        ],

        keyDecisions: [
            {
                type: String,
            },
        ],

        risks: [
            {
                type: String,
            },
        ],

        nextSteps: [
            {
                type: String,
            },
        ],
    },
    {
        timestamps:true,
    }
);

export default mongoose.model("Summary" , summarySchema);