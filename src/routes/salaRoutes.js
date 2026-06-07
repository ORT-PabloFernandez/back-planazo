import express from 'express';
import { createSala, getAllSalas, getSalaById, updateSala, deleteSala } from '../controllers/salaController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const salaRouters = express.Router();

salaRouters.get('/', authMiddleware, getAllSalas);
salaRouters.post('/', authMiddleware, createSala);
salaRouters.delete('/:id', authMiddleware, deleteSala);
salaRouters.get('/:id', getSalaById);

export default salaRouters;