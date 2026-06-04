import express from "express";
import { sugerirPlanes, obtenerHistorial } from "../controllers/planController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const planRouter = express.Router();

planRouter.post("/suggest", authMiddleware, sugerirPlanes);
planRouter.get("/historial", authMiddleware, obtenerHistorial);

export default planRouter;
