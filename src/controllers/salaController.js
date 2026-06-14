import { getSalas, getSalaById, createSalaService, updateSalaService, deleteSalaService } from "../services/salaService.js";
import { sugerirPlanes } from "./planController.js";

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

export async function agregarParticipanteController(req, res) {
    try {
    const sala = await getSalaById(req.params.id);
    const participante = req.body.idParticipante;
    const existe = await getUserById(participante);

    if (!sala) {
        return res.status(404).json({ message: "Sala no encontrada" });
    }
    if(!participante) {
        return res.status(400).json({ message: "ID del participante es requerido" });
    }
    if(!existe){
        return res.status(404).json({ message: "Usuario no registrado" });
    }
    if (sala.participantes.includes(participante)) {
        return res.status(400).json({ message: "El participante ya esta en la sala" });
    }

    sala.participantes.push(participante);
    await updateSalaService(req.params.id, sala);
    res.json({ message: "Participante agregado exitosamente" });
    } catch (error) {    
        res.status(500).json({ message: "Error al agregar participante"});
    } 
}

//TODO
export async function planGanadorController(req, res) {}

//TODO
export async function agregarPlanController(req, res) {
    try {
        const sala = await getSalaById(req.params.id);
        if (!sala) {
            return res.status(404).json({ message: "Sala no encontrada" });
        }

        const { participantes, preferencias, restriccionesComida, presupuesto, zona, disponibilidad, edadPromedio } = sala 
        const cantidadParticipantes = participantes.length; 
        const planes = await 
        sugerirPlanes({ cantidadParticipantes, preferencias, restriccionesComida, presupuesto, zona, disponibilidad, edadPromedio })
        
        console.log(planes);
        sala.planesSugeridos = planes;
        await updateSalaService(req.params.id, sala);
        res.json({ message: "Planes agregados exitosamente" });
    } catch {
        res.status(500).json({ message: "Error al agregar planes"});
    }
}


export async function deleteSalaController(req, res) {
    try {
        await deleteSalaService(req.params.id);
        res.json({ message: "Sala eliminada exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar sala"});
    }
}
export async function obtenerPlanesController(req,res){
    try {
        const sala = await getSalaById(req.params.id);
        if (!sala) {
            return res.status(404).json({ message: "Sala no encontrada" });
        }
        res.json(sala.planesSugeridos || []);
    }catch(error){
        res.status(500).json({ message: "Error al obtener planes"});
    }
}