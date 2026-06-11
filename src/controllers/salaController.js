import { getSalas, getSalaById, createSalaService, updateSalaService, deleteSalaService } from "../services/salaService.js";

export async function getSalasController(req, res) {
    try {
        res.json(await getSalas());
    } catch (error) {
        res.status(500).json({ message: "Error al obtener salas"});
    }
}

export async function getSalaByIdController(req, res) {
    try {
        const sala = await getSalaById(req.params.id);
        if (!sala) {
            return res.status(404).json({ message: "Sala no encontrada" });
        }
        res.json(sala);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener sala por ID"});
    }
}

export async function createSalaController(req, res) {
    const { idHost, nombre, tipoAct, intereses, restricciones, ubicacion, fecha, hora, presupuesto } = req.body;

    if (!idHost || !nombre || !tipoAct || !intereses || !restricciones || !ubicacion || !fecha || !hora || !presupuesto) {
        return res.status(400).json({ message: "Todos los campos son requeridos" });
    }
    try {
        const result = await createSalaService({ idHost, nombre, tipoAct, intereses, restricciones, ubicacion, fecha, hora, presupuesto });
        res.status(201).json({ message: "Sala creada exitosamente", salaId: result.insertedId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear sala"});
    }
}
//TODO
export async function agregarParticipanteController(req, res) {
    //como manejamos aca el tema seguridad con el id del participante? lo pasamos por body o lo sacamos del token? 
}
//TODO
export async function planGanadorController(req, res) {}

//TODO
export async function agregarPlanController(req, res) {}

export async function deleteSalaController(req, res) {
    try {
        await deleteSalaService(req.params.id);
        res.json({ message: "Sala eliminada exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar sala"});
    }
}