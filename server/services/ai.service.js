import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
})

export const generateMeetingSummary = async(transcript)=>{
    const conversation = transcript
    .map((msg) => `${msg.speaker}:${msg.text}`)
    .join("\n");

    const prompt = `
            You are an AI meeting assistant.

            Analyze the following meeting transcript and return ONLY valid JSON.

            {
            "summary": "...",
            "actionItems": [],
            "keyDecisions": [],
            "risks": [],
            "nextSteps": []
            }

            Transcript: ${conversation}
    `;

    const completion = await groq.chat.completions.create({
        model : "llama-3.3-70b-versatile",
        messages : [
            {
                role : "user",
                content:prompt,
            },
        ],
        temperature: 0.3,
        response_format:{
            type: "json_object",
        },
    });

    return JSON.parse(
        completion.choices[0].message.content
    )
}