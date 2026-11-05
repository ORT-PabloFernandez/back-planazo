import { getDb, connectToDatabase } from "./connection.js";
import { ObjectId } from "mongodb";

export async function findAllSalas() {
    await connectToDatabase();
    const db = getDb();
    const salas = await db.collection('salas').find().toArray();
    return salas;
}

export async function findSalaById(id) {
    await connectToDatabase();
    const db = getDb();
    const sala = await db.collection('salas').findOne({ _id: new ObjectId(id) });
    return sala;
}

export async function createSala({idHost, nombre, tipoAct, intereses, restricciones, ubicacion, fecha, hora, presupuesto}) {
    await connectToDatabase();
    const db = getDb();

    const newSala = {
        idHost,
        nombre,
        tipoAct,
        intereses,
        restricciones,
        ubicacion,
        fecha,
        hora,
        presupuesto,
        planesSugeridos: [],
        planGanador: null,
        participantes: [idHost]
    };
    const result = await db.collection('salas').insertOne(newSala);

    return result;
}

//esto va para agregar un participante o definir el plan ganador por ej, o deberiamos hacer metodos particulares para cada funcionalidad de estas
export async function updateSala(id, salaActualizada) {
    await connectToDatabase();
    const db = getDb();
    const result = await db.collection('salas').updateOne({ _id: new ObjectId(id) }, { $set: salaActualizada });
    return result;
}

export async function deleteSala(id) {
    await connectToDatabase();
    const db = getDb();
    const result = await db.collection('salas').deleteOne({ _id: new ObjectId(id) });
    return result;
}
export async function sumarVoto(idSala, idPlan) {
    await connectToDatabase();
    const db = getDb();
    const sala = await db.collection('salas').findOne({ _id: new ObjectId(idSala) });
    const plan = sala.planesSugeridos.find(plan => plan._id.toString() === idPlan);
    if (plan) {
        plan.votos++;
        await db.collection('salas').updateOne({ _id: new ObjectId(sala._id) }, { $set: { planesSugeridos: sala.planesSugeridos } });
        return plan;
    } else {
        throw new Error("Plan no encontrado");
    }
}

