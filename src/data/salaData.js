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
        participantes: []
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

//deuda tecnincaaaaaa
export async function contarVotos(idSala) {}
   