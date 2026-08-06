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

export default defineAgent({
    entry: async (ctx) => {
        await connectDB();
        console.log("Mongo state:", mongoose.connection.readyState);
        console.log("Job received!");

        await ctx.connect();

        const stt = new STTv2({
            model: "flux-general-en",
            sampleRate: 48000,
        });
        const transcript = [];
        ctx.addShutdownCallback(async () => {
            try {
                await Transcript.create({
                    meetingId: ctx.room.name,
                    transcript,
                });

                console.log("✅ Transcript saved successfully");
            } catch (err) {
                console.error("❌ Failed to save transcript:", err);
            }
        });

        console.log("Deepgram initialized");
        console.log(`Connected to room: ${ctx.room.name}`);

        ctx.room.on(RoomEvent.TrackSubscribed, async (track, publication, participant) => {
            if (track.kind !== TrackKind.KIND_AUDIO) return;
            const speakerInfo = JSON.parse(participant.metadata);
            console.log(`Subscribed to audio from ${participant.identity}`);

            const audioStream = new AudioStream(track);
            const reader = audioStream.getReader();

            (async () => {
                while (true) {
                    const { value, done } = await reader.read();

                    if (done) break;

                    dgStream.pushFrame(value);
                }

                dgStream.flush();
            })();
            console.log("Audio stream created");
            
            const dgStream = stt.stream();
            (async () => {
                for await (const event of dgStream) {

                    if (event.type === 2) {
                        transcript.push({
                            speaker: speakerInfo.name,
                            text: event.alternatives[0].text,
                            timestamp: new Date(),
                        });

                        console.log(transcript);
                    }

                }
            })();

            console.log(`Deepgram stream created for ${participant.identity}`);

        });

    },
});
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    await connectDB();
    cli.runApp(
        new ServerOptions({
            agent: fileURLToPath(import.meta.url),
            agentName: "contextsync-transcriber",
        })
    );
}