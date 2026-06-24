import { getSalas, getSalaById, createSalaService, updateSalaService, deleteSalaService, sumarVotoService} from "../services/salaService.js";
import {updateUserService} from "../services/userService.js";
import { sugerirPlanes } from "./planController.js";
import {ObjectId} from "mongodb";
import { findUserById } from "../data/userData.js";

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
    const existe = await findUserById(participante);

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

export async function obtenerPlanGanadorController(req, res) {
    try {
        const sala = await getSalaById(req.params.id);

        if (!sala) {
            return res.status(404).json({ message: "Sala no encontrada" });
        }
        if (sala.planesSugeridos.length === 0) {
            return res.status(400).json({ message: "No hay planes sugeridos en esta sala" });
        }

        const maxVotos = Math.max(...sala.planesSugeridos.map(plan => plan.votos));
        const planesMax = sala.planesSugeridos.filter(plan => plan.votos === maxVotos);
        let resul;

        if (planesMax.length > 1) {
            sala.planesSugeridos = planesMax.map(plan => ({ ...plan, votos: 0 })); 
            resul = { empate: true, planes: planesMax };
        } else {
            sala.planGanador = planesMax[0];
            resul = { empate: false, ganador: planesMax[0] };
           // await agregarPlanHistorial(sala);        
        }

        await updateSalaService(req.params.id, sala);
        res.json(resul);
    } catch (error) {
        res.status(500).json({ message: "Error interno al obtener el plan ganador" });
    }
}
/* export async function agregarPlanHistorial(sala) {
    const planGanador = sala.planGanador;
    if (!planGanador) {
        throw new Error("No hay plan ganador para agregar al historial");
    }

    const ids = [...new Set([sala.idHost, ...(sala.participantes || [])].filter(Boolean))];

    for (const participanteId of ids) {
        const user = await findUserById(participanteId);
        if (!user) continue;

        const historialP = [...(user.historialPlanes || []), planGanador];
        await updateUserService(user._id, { historialPlanes: historialP });
    }
} */


export async function agregarPlanController(req, res) {
    try {
        const sala = await getSalaById(req.params.id);
        if (!sala) {
            return res.status(404).json({ message: "Sala no encontrada" });
        }

        const { participantes, preferencias, restriccionesComida, presupuesto, zona, disponibilidad, edadPromedio } = sala 
        const cantidadParticipantes = participantes.length; 
        const edadPromCalculada = await calcularEdadPromedio(participantes);
        const planes = await 
        sugerirPlanes({ cantidadParticipantes, preferencias, restriccionesComida, presupuesto, zona, disponibilidad, edadPromCalculada })
        
        const planesConId = planes.map((plan) => ({ _id: new ObjectId(), ...plan, votos: 0 }));
        sala.planesSugeridos = planesConId;
        await updateSalaService(req.params.id, sala);
        res.json({ message: "Planes agregados exitosamente" });
    } catch {
        res.status(500).json({ message: "Error al agregar planes"});
    }
}

async function calcularEdadPromedio(participantes) {
    const hoy = new Date();
    const años = await Promise.all(
        participantes.map(async (participante) => {
            const user = await findUserById(participante);
            if (!user || !user.fechaNacimiento) {
                return null;
            }
            return new Date(user.fechaNacimiento).getFullYear();
        })
    );

    const edades = años
        .filter((año) => año !== null)
        .map((año) => hoy.getFullYear() - año);

    if (edades.length === 0) {
        return 0;
    }

    const acum = edades.reduce((acc, edad) => acc + edad, 0);
    return (acum / edades.length);
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

export async function votarPlanController(req,res){
    try{
        const plan = await sumarVotoService(req.params.idSala, req.params.idPlan);
        res.json({ message: "Voto registrado exitosamente" , plan});
    }catch(error){
        res.status(500).json({ message: "Error al votar plan"});
    }
}