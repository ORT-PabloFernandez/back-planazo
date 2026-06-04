import { generarSugerencias } from "../services/planService.js";
import { savePlanSuggestion, getPlansByUser } from "../data/planData.js";

export async function sugerirPlanes(req, res) {
    const {
        cantidadChicos,
        cantidadChicas,
        cantidadPersonas,
        preferencias,
        restriccionesComida,
        presupuesto,
        zona,
        disponibilidad,
        edadPromedio,
        ubicacion,
    } = req.body;

    const tieneConteo =
        cantidadPersonas != null ||
        (cantidadChicos != null && cantidadChicas != null);

    if (!tieneConteo) {
        return res.status(400).json({
            message:
                "Debés indicar cantidadPersonas, o bien cantidadChicos y cantidadChicas",
        });
    }

    const input = {
        cantidadChicos,
        cantidadChicas,
        cantidadPersonas,
        preferencias,
        restriccionesComida,
        presupuesto,
        zona,
        disponibilidad,
        edadPromedio,
        ubicacion,
    };

    try {
        const planes = await generarSugerencias(input);

        if (req.user) {
            await savePlanSuggestion(req.user._id, input, planes).catch((err) =>
                console.error("Error al guardar planes:", err)
            );
        }

        res.json({ planes });
    } catch (error) {
        console.error("Error al generar sugerencias:", error);
        res.status(500).json({ message: "Error al generar sugerencias de planes" });
    }
}

export async function obtenerHistorial(req, res) {
    try {
        const historial = await getPlansByUser(req.user._id);
        res.json({ historial });
    } catch (error) {
        console.error("Error al obtener historial:", error);
        res.status(500).json({ message: "Error al obtener el historial de planes" });
    }
}
