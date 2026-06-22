import { getUsers, registerUserService, loginUserService, getUserByIdService } from "../services/userService.js";
import jwt from "jsonwebtoken";

export async function getAllUsers(req, res) {
    try {
        res.json(await getUsers());
        
    } catch (error) {
        res.json({message: "Error al obtener usuarios", error: error.message});
    }
}

export async function getUserById(req, res) {
    try{
        const user = await getUserByIdService(req.params.id);
        res.json(user);
    }catch(error){
        res.status(404).json({message: "Usuario no encontrado"});
    }
}

export async function loginUserController(req, res) {
    const {email, password} = req.body;

    if(!email || !password) {
        return res.status(400).json({message: "Email y password son requeridos"});
    }

    try {
        const user = await loginUserService(email, password);
        const token = jwt.sign({_id: user._id, email: user.email}, process.env.JWT_SECRET, {expiresIn: '1h'});

        res.json({message: "Login exitoso", user, token});

    } catch (error) {
        if(error.message === 'Credenciales inválidas') {
            return res.status(401).json({message: error.message});
        }
        console.error(error);
        res.status(500).json({message: "Error interno en el login"});
    }

}

export async function registerUserController(req, res) {
    const {name, email, password, fechaNacimiento} = req.body;

    if(!name || !email || !password) {
        return res.status(400).json({message: "Name, email y password son requeridos"});
    }

    try {
        const result = await registerUserService({name, email, password, fechaNacimiento});
        res.status(201).json({message: "Usuario registrado exitosamente", userId: result.insertedId});
    } catch (error) {
        if(error.message === 'El email ya está registrado') {
            return res.status(400).json({message: error.message});
        }
        console.error(error);
        res.status(500).json({message: "Error interno en el registro de usuario"});
    }
}
