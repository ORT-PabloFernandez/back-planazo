import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import planRoutes from './routes/planRoutes.js';

const app = express();

// Middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/users", userRoutes);
app.use("/api/plans", planRoutes);

// Ruta base
app.get('/', (req, res) => {
    res.send("API funcionando 🚀");
});


app.use((req, res) => {
    res.status(404).json({ message: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {      
    const status = err.status || 500;
    const message = err.message || "Error interno del servidor";
    res.status(status).json({ message });
})

export default app;
