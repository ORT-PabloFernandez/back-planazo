import { findAllSalas, findSalaById, createSala, updateSala, deleteSala, sumarVoto } from "../data/salaData.js";

export async function getSalas() {
    return await findAllSalas();        
}

export async function getSalaById(id) {
    return await findSalaById(id);        
}

export async function createSalaService(salaData) {
    return await createSala(salaData);
}

export async function updateSalaService(id, salaActualizada) {
    return await updateSala(id, salaActualizada);
}

export async function deleteSalaService(id) {
    return await deleteSala(id);
}
export async function sumarVotoService(idSala, idPlan) {
    return await sumarVoto(idSala, idPlan);
}
export async function contarVotosService(idSala) {}