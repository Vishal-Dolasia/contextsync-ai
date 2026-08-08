import embeddingModel from "../models/embedding.model.js";
import { createChunks } from "./chunking.services.js";
import { generateEmbedding } from "./embedding.services.js";
import transcriptModel from "../models/transcript.model.js";
export const storingChunksInEmbeddingModel = async (meetingId)=>{
    const transcriptDoc = await transcriptModel.findOne({meetingId});
    if(!transcriptDoc){
        console.log("transcipt for this meeting is not available");
        return;
    }
    const chunksOfTranscript = createChunks(transcriptDoc.transcript);
    
    if(!chunksOfTranscript || chunksOfTranscript.length === 0){
        console.log("Error in creating chuncks of this transcript");
        return;
    }

    for (let i = 0; i < chunksOfTranscript.length; i++) {

        const chunk = chunksOfTranscript[i];

        const embeddingOfChunk = await generateEmbedding(chunk.text);

        if (!embeddingOfChunk) {
            console.log(`Embedding for chunk ${i} was not generated`);
            continue;
        }

        await embeddingModel.create({
            meetingId: meetingId,
            chunkIndex: i,
            text: chunk.text,
            embedding: Array.from(embeddingOfChunk),
            startTime: chunk.startTime,
            endTime: chunk.endTime,
        });
    }
    return {
        message: "Chunks and embeddings stored successfully",
        count: chunksOfTranscript.length
    };
}
