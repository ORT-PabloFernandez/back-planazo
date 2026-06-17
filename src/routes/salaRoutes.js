import express from 'express';
import { getSalasController, createSalaController, getSalaByIdController, deleteSalaController, agregarParticipanteController, agregarPlanController, obtenerPlanesController, votarPlanController, obtenerPlanGanadorController } from '../controllers/salaController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const salaRouters = express.Router();

salaRouters.get('/', authMiddleware, getSalasController);
salaRouters.post('/crearSala', authMiddleware, createSalaController);
salaRouters.get('/obtenerPlanes/:id', authMiddleware, obtenerPlanesController);
salaRouters.put('/:idSala/votarPlan/:idPlan', authMiddleware, votarPlanController);
salaRouters.put('/sugerir/:id',authMiddleware, agregarPlanController);
salaRouters.delete('/borrarSala/:id', authMiddleware, deleteSalaController);
salaRouters.put('/agregarParticipante/:id', authMiddleware, agregarParticipanteController);
salaRouters.put('/planGanador/:id', authMiddleware, obtenerPlanGanadorController);
salaRouters.get('/:id', getSalaByIdController);

export default salaRouters; 