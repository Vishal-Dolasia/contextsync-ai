import express from "express";
import { answerMeetingQuestion } from "../services/rag.services.js";

const router = express.Router();

router.post("/ask", async (req, res) => {
    try {
        const { question,meetingId } = req.body;

        if (!question) {
            return res.status(400).json({
                message: "Question is required"
            });
        }
        if (!meetingId) {
            return res.status(400).json({
                message: "Meeting ID is required"
            });
        }

        const answer = await answerMeetingQuestion(question,meetingId);

        return res.status(200).json({
            answer
        });

    } catch (error) {
        console.error("AI question error:", error);

        return res.status(500).json({
            message: "Failed to answer question"
        });
    }
});

export default router;