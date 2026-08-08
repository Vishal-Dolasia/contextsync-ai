import { pipeline } from '@huggingface/transformers';

const model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');


export const generateEmbedding = async(text)=>{
    const output = await model(text,{
        pooling : "mean",
        normalize: true,
    });

    const array = output.data;
    return array;
};
