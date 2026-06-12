import { findAllUsers, findByCredentials, registerUser } from "../data/userData.js";

export async function getUsers() {
    return await findAllUsers();        
}

export async function loginUserService(email, password) {
    const user = await findByCredentials(email, password);
    if(!user){
        throw new Error('Credenciales inválidas');        
    }
    const { password: _pw, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

export async function registerUserService({name, email, password, fechaNacimiento}) {
    try {
        return await registerUser({name, email, password, fechaNacimiento});
        
    } catch (error) {
        if(error.message === 'El email ya está registrado') {
            throw error;
        }
        throw new Error('Error al registrar el usuario');   
    }
}
