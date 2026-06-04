import express from 'express';
import { getAllUsers, getUserById, loginUserController, registerUserController } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const userRouters = express.Router();

userRouters.get('/', authMiddleware, getAllUsers);
userRouters.get('/:id', getUserById);
userRouters.post('/login', loginUserController);
userRouters.post('/register', registerUserController);

export default userRouters;
