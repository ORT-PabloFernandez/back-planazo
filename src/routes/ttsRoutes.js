import express from "express";
import { generarAudio } from "../controllers/ttsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const ttsRouter = express.Router();

ttsRouter.post("/", generarAudio);

export default ttsRouter;
