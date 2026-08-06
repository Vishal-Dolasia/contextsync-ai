import mongoose, { Schema } from 'mongoose';
const transcriptSchema = new Schema({
    meetingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "meeting",
            required: true,
        },

        transcript: [
            {
                speaker: {
                    type: String,
                    required: true,
                },

                text: {
                    type: String,
                    required: true,
                },

                timestamp: {
                    type: Date,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);
export default mongoose.model("transcript", transcriptSchema);