import express from 'express';
import { getAllUsers, getUserById, loginUserController, registerUserController, agregarPreferenciasController, listarPlanesGanadoresController } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const userRouters = express.Router();

userRouters.get('/', authMiddleware, getAllUsers);
userRouters.post('/login', loginUserController);
userRouters.post('/register', registerUserController);
userRouters.put('/agregarPreferencias/:id', agregarPreferenciasController);
userRouters.get('/listarPlanesGanadores/:id', listarPlanesGanadoresController);
userRouters.get('/:id', authMiddleware, getUserById);

export default userRouters;
