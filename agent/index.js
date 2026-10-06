import dotenv from "dotenv";
import connectDB from "./db/connect.js"
dotenv.config();
import Transcript from "./models/transcript.model.js";
import { defineAgent, cli, ServerOptions } from "@livekit/agents";
import { STTv2 } from "@livekit/agents-plugin-deepgram";
import mongoose from "mongoose";
import {
    AudioStream,
    RoomEvent,
    TrackKind,
} from "@livekit/rtc-node";
import { fileURLToPath } from "url";
import http from "http";

const AGENT_NAME = "contextsync-transcriber";
const REQUIRED_ENV = [
    "LIVEKIT_URL",
    "LIVEKIT_API_KEY",
    "LIVEKIT_API_SECRET",
    "DEEPGRAM_API_KEY",
    "MONGO_URI",
    "BACKEND_URL",
    "AGENT_INTERNAL_SECRET",
];

const validateEnv = () => {
    const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required agent environment variables: ${missing.join(", ")}`);
    }
};

const startHealthServer = () => {
    const port = process.env.PORT;

    if (!port) return;

    const server = http.createServer((req, res) => {
        if (req.url === "/healthz") {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: true, agentName: AGENT_NAME }));
            return;
        }

        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("LiveKit agent worker is running\n");
    });

    server.listen(port, () => {
        console.log(`Agent health server listening on port ${port}`);
    });
};

const readParticipantName = (participant) => {
    try {
        return JSON.parse(participant.metadata || "{}").name || participant.identity;
    } catch {
        return participant.identity;
    }
};

export default defineAgent({
    entry: async (ctx) => {
        console.log(`Job received for agent: ${AGENT_NAME}`);

        await ctx.connect();
        console.log(`Connected to room: ${ctx.room.name}`);

        try {
            await connectDB();
            console.log("Mongo state:", mongoose.connection.readyState);
        } catch (err) {
            console.error("Agent MongoDB connection failed:", err);
        }

        const stt = new STTv2({
            model: "flux-general-en",
            sampleRate: 48000,
        });
        const transcript = [];
        ctx.addShutdownCallback(async () => {
            try {
                const meetingId = ctx.room.name;

                await Transcript.create({
                    meetingId,
                    transcript,
                });

                console.log(`✅ Transcript saved successfully for meeting: ${meetingId}`);

                // Generate summary
                try {
                    console.log(`⏳ Generating summary for meeting: ${meetingId}`);

                    const response = await fetch(
                        `${process.env.BACKEND_URL}/api/meetings/${meetingId}/generate-summary`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "x-agent-secret": process.env.AGENT_INTERNAL_SECRET,
                            },
                        }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(
                            `Summary API returned ${response.status}: ${JSON.stringify(data)}`
                        );
                    }

                    console.log("✅ Summary generated successfully");
                } catch (err) {
                    console.error("❌ Summary generation failed:", err);
                }

                // Generate embeddings
                try {
                    console.log(`⏳ Generating embeddings for meeting: ${meetingId}`);

                    const response = await fetch(
                        `${process.env.BACKEND_URL}/api/meetings/${meetingId}/generate-embeddings`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "x-agent-secret": process.env.AGENT_INTERNAL_SECRET,
                            },
                        }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(
                            `Embedding API returned ${response.status}: ${JSON.stringify(data)}`
                        );
                    }

                    console.log("✅ Embeddings generated successfully");
                } catch (err) {
                    console.error("❌ Embedding generation failed:", err);
                }

            } catch (err) {
                console.error("❌ Failed to save transcript:", err);
            }
        });

        console.log("Deepgram initialized");

        ctx.room.on(RoomEvent.TrackSubscribed, async (track, publication, participant) => {
            if (track.kind !== TrackKind.KIND_AUDIO) return;
            const speakerName = readParticipantName(participant);
            console.log(`Subscribed to audio from ${participant.identity}`);

            const audioStream = new AudioStream(track);
            const reader = audioStream.getReader();
            const dgStream = stt.stream();

            (async () => {
                try {
                    while (true) {
                        const { value, done } = await reader.read();

                        if (done) break;

                        dgStream.pushFrame(value);
                    }

                    dgStream.flush();
                } catch (err) {
                    console.error(`Audio stream failed for ${participant.identity}:`, err);
                }
            })();
            console.log("Audio stream created");

            (async () => {
                try {
                    for await (const event of dgStream) {

                        if (event.type === 2) {
                            transcript.push({
                                speaker: speakerName,
                                text: event.alternatives[0].text,
                                timestamp: new Date(),
                            });

                            console.log(transcript);
                        }

                    }
                } catch (err) {
                    console.error(`Deepgram stream failed for ${participant.identity}:`, err);
                }
            })();

            console.log(`Deepgram stream created for ${participant.identity}`);

        });

    },
});
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    console.log(`Starting LiveKit agent worker: ${AGENT_NAME}`);
    console.log("Agent env check:", {
        livekitUrl: Boolean(process.env.LIVEKIT_URL),
        livekitApiKey: Boolean(process.env.LIVEKIT_API_KEY),
        livekitApiSecret: Boolean(process.env.LIVEKIT_API_SECRET),
        deepgramApiKey: Boolean(process.env.DEEPGRAM_API_KEY),
        backendUrl: Boolean(process.env.BACKEND_URL),
        agentInternalSecret: Boolean(process.env.AGENT_INTERNAL_SECRET),
        mongoUri: Boolean(process.env.MONGO_URI),
    });
    validateEnv();
    startHealthServer();
    cli.runApp(
        new ServerOptions({
            agent: fileURLToPath(import.meta.url),
            agentName: AGENT_NAME,
        })
    );
}
