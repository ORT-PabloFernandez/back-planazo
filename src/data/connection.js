import {MongoClient} from 'mongodb';
const uri = process.env.MONGODB_URI;

if(!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
}

let client;
let db;

export async function connectToDatabase() {
    if (!client) {
        try {
            client = new MongoClient(uri);
            await client.connect();
            db = client.db("planazo"); 
            console.log("Conexion a MongoDB establecida");
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
            throw error;
        }                
    }
    return db;
}

export function getDb() {
    if (!db) {
        throw new Error('Database connection is not established. Call connectToDatabase first.');
    }
    return db;
}
