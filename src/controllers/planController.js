import { generarSugerencias } from "../services/planService.js";
import { savePlanSuggestion, getPlansByUser } from "../data/planData.js";

export async function sugerirPlanes(data) {
    const {
        cantidadPersonas,
        preferencias,
        restriccionesComida,
        presupuesto,
        zona,
        disponibilidad,
        edadPromedio,
    } = data;

    const input = {
        cantidadPersonas,
        preferencias,
        restriccionesComida,
        presupuesto,
        zona,
        disponibilidad,
        edadPromedio,
    };

    try {
        const planes = await generarSugerencias(input);

        // if (req.user) {
        //     await savePlanSuggestion(req.user._id, input, planes).catch((err) =>
        //         console.error("Error al guardar planes:", err)
        //     );
        // }

        return planes;
    } catch (error) {
        console.error("Error al generar sugerencias:", error);
        throw error ("Error al generar sugerencias de planes");
        //res.status(500).json({ message: "Error al generar sugerencias de planes" });
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
