import express from "express";
import { traducirTexto } from "../controllers/translateController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const translateRouter = express.Router();

translateRouter.post("/", authMiddleware, traducirTexto);

export default translateRouter;
