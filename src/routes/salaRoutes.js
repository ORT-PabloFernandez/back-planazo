import express from 'express';
import { getSalasController, createSalaController, getSalaByIdController, deleteSalaController, agregarParticipanteController } from '../controllers/salaController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const salaRouters = express.Router();

salaRouters.get('/', authMiddleware, getSalasController);
salaRouters.post('/crearSala', authMiddleware, createSalaController);
salaRouters.delete('/borrarSala/:id', authMiddleware, deleteSalaController);
salaRouters.put('/agregarParticipante/:id', authMiddleware, agregarParticipanteController);
salaRouters.get('/:id', getSalaByIdController);

export default salaRouters;