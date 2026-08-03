import dotenv from "dotenv";
dotenv.config();

import { defineAgent, cli, ServerOptions } from "@livekit/agents";
import { STTv2 } from "@livekit/agents-plugin-deepgram";

import {
    AudioStream,
    RoomEvent,
    TrackKind,
} from "@livekit/rtc-node";

import { fileURLToPath } from "url";

export default defineAgent({
    entry: async (ctx) => {
        console.log("Job received!");

        await ctx.connect();

        const stt = new STTv2({
            model: "flux-general-en",
            sampleRate: 48000,
        });

        console.log("Deepgram initialized");
        

        console.log(`Connected to room: ${ctx.room.name}`);

        const participant = await ctx.waitForParticipant();

        console.log(`Participant joined: ${participant.identity}`);


        ctx.room.on(RoomEvent.TrackSubscribed, async (track, publication, participant) => {
            if (track.kind !== TrackKind.KIND_AUDIO) return;

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

                    // Final transcript only
                    if (event.type === 2) {
                        console.log(
                            `[${participant.identity}] ${event.alternatives[0].text}`
                        );
                    }

                }
            })();

            console.log(`Deepgram stream created for ${participant.identity}`);

        });

    },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    cli.runApp(
        new ServerOptions({
            agent: fileURLToPath(import.meta.url),
            agentName: "contextsync-transcriber",
        })
    );
}