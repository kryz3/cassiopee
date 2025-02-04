const fs = require('fs');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function uploadTrainingFile() {
    try {
        const response = await openai.files.create({
            file: fs.createReadStream('script.jsonl'),
            purpose: 'fine-tune'
        });

        console.log("Uploaded File ID:", response.id);
        return response.id;
    } catch (error) {
        console.error("Error uploading file:", error);
    }
}

async function createFineTune(fileId) {
    try {
        const response = await openai.fineTunes.create({
            training_file: fileId,
            model: "gpt-3.5-turbo"
        });

        console.log("Fine-tuning Job ID:", response.id);
    } catch (error) {
        console.error("Error creating fine-tuning job:", error);
    }
}

(async () => {
    const fileId = await uploadTrainingFile();
    if (fileId) {
        await createFineTune(fileId);
    }
})();
