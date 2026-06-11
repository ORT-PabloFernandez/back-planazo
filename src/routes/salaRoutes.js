import express from 'express';
import { getSalasController, createSalaController, getSalaByIdController, deleteSalaController } from '../controllers/salaController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const salaRouters = express.Router();

salaRouters.get('/', authMiddleware, getSalasController);
salaRouters.post('/crearSala', authMiddleware, createSalaController);
salaRouters.delete('/borrarSala/:id', authMiddleware, deleteSalaController);
salaRouters.get('/:id', getSalaByIdController);

export default salaRouters;