import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export const VOCES = ["autumn", "diana", "hannah", "austin", "daniel", "troy"];

export async function textoAAudio(texto, voz = "troy") {
    const response = await openai.audio.speech.create({
        model: "canopylabs/orpheus-v1-english",
        voice: voz,
        input: texto,
        response_format: "wav",
    });

    return Buffer.from(await response.arrayBuffer());
}
