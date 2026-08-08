import "dotenv/config";
import mongoose from "mongoose";

import { answerMeetingQuestion } from "./services/rag.services.js";

await mongoose.connect(process.env.MONGO_URI);

console.log("MongoDB connected");

const answer = await answerMeetingQuestion(
    "What did Rahul say about deployment?"
);

console.log("\nAI Answer:\n");
console.log(answer);

await mongoose.disconnect();