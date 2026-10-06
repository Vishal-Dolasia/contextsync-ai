import { Groq } from "groq-sdk";
import { searchRelevantChunks } from "./retriveval.services.js";
import { GROQ_CHAT_MODEL } from "../config/ai.config.js";

const groq = new Groq({
    apiKey : process.env.GROQ_API_KEY
})

export const answerMeetingQuestion = async(question,meetingId)=>{
    const relevantChunks = await searchRelevantChunks(question,meetingId);

    if (!relevantChunks || relevantChunks.length === 0) {
        return "I couldn't find relevant information in the meetings.";
    }


    const context = relevantChunks
        .map((chunk) => chunk.text)
        .join("\n\n");

    const completion = await groq.chat.completions.create({
            model: GROQ_CHAT_MODEL,

            messages: [
                {
                    role: "system",
                    content: `
                        You are an AI meeting assistant.

                        Answer the user's question using ONLY the provided meeting context.

                        Do not use outside knowledge.

                        If the answer cannot be found in the provided context, say:
                        "The information is not available in the meeting context."
                    `
                },
                {
                    role: "user",
                    content: `
                                Meeting Context:

                                ${context}

                                Question:

                                ${question}
                    `
                }
            ],

            temperature: 0.2,
        });

        return completion.choices[0].message.content;
    };    
