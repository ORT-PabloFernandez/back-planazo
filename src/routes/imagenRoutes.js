import express from "express";
import { subir, listar, obtenerUrl } from "../controllers/imagenController.js";

const imagenRouter = express.Router();

imagenRouter.post("/", express.raw({ type: "image/*", limit: "10mb" }), subir);
imagenRouter.get("/", listar);
imagenRouter.get("/:nombre", obtenerUrl);

export default imagenRouter;
