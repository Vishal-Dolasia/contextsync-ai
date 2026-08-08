const CHUNK_SIZE = 1200;

export const createChunks  = (transcipt) =>{
    const chunks = [];
    let currChunk = {
        text: "",
        startTime: null,
        endTime: null
    };
    for(const one of transcipt){
        const newText = `${one.speaker}: ${one.text}\n`;
        if (
            currChunk.text.length > 0 &&
            currChunk.text.length + newText.length > CHUNK_SIZE
        ) {
            chunks.push(currChunk);

            currChunk = {
                text: "",
                startTime: null,
                endTime: null
            };
        }
        if (currChunk.startTime === null) {
            currChunk.startTime = one.timestamp;
        }

        currChunk.text += newText;

        // Keep updating the ending timestamp
        currChunk.endTime = one.timestamp;
    }

    if (currChunk.text.length > 0) {
        chunks.push(currChunk);
    }
    return chunks;
}