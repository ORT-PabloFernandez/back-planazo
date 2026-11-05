import { textoAAudio, VOCES } from "../services/ttsService.js";

export async function generarAudio(req, res) {
    const { texto, voz } = req.body;

    if (!texto || typeof texto !== "string" || !texto.trim()) {
        return res.status(400).json({ message: "Debés indicar el texto en inglés a convertir en audio" });
    }

    if (voz && !VOCES.includes(voz)) {
        return res.status(400).json({ message: `La voz debe ser una de: ${VOCES.join(", ")}` });
    }

    try {
        const audio = await textoAAudio(texto.trim(), voz);
        res.set({
            "Content-Type": "audio/wav",
            "Content-Disposition": 'inline; filename="audio.wav"',
        });
        res.send(audio);
    } catch (error) {
        console.error("Error al generar audio:", error);
        res.status(500).json({ message: "Error al generar el audio" });
    }
}
