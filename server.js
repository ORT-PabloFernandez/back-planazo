import "dotenv/config";
import app from "./src/app.js";


const PORT = process.env.PORT || 3001;
async function startServer() {
    try {
        app.listen(PORT, () => {
            console.log(`Servidor escuchando en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error("Error al iniciar el servidor:", error);
        process.exit(1);
    }
}

startServer();
