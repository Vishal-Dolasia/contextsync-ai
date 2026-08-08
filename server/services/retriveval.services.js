import { encodeBase64 } from "bcryptjs";
import embeddingModel from "../models/embedding.model.js";
import { generateEmbedding } from "./embedding.services.js";
import meetingModel from "../models/meeting.model.js";

export const searchRelevantChunks = async (question) => {
    const questionEmbedding = await generateEmbedding(question);
    const queryVector = Array.from(questionEmbedding);

    const result = await embeddingModel.aggregate([
        {
            $vectorSearch : {
                index : "vector_index",
                path : "embedding",
                queryVector : queryVector,
                numCandidates : 20,
                limit : 3
            }
        },
        {
            $project: {
                _id: 0,
                meetingId: 1,
                chunkIndex: 1,
                text: 1,
                startTime: 1,
                endTime: 1,
                score: {
                    $meta: "vectorSearchScore"
                }
            }
        }
    ]);

    return result;
};