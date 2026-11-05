import { traducir } from "../services/translateService.js";

export async function traducirTexto(req, res) {
    const { texto } = req.body;

    if (!texto || typeof texto !== "string" || !texto.trim()) {
        return res.status(400).json({ message: "Debés indicar el texto a traducir" });
    }

    try {
        const resultado = await traducir(texto.trim());
        res.json(resultado);
    } catch (error) {
        if (error.status === 400) {
            return res.status(400).json({ message: error.message });
        }
        console.error("Error al traducir:", error);
        res.status(500).json({ message: "Error al traducir el texto" });
    }
}
