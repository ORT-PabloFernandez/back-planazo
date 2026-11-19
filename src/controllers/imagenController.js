import { subirImagen, listarImagenes, existeImagen, urlPublica, TIPOS_PERMITIDOS } from "../services/imagenService.js";

export async function subir(req, res) {
    const contentType = req.headers["content-type"];

    if (!TIPOS_PERMITIDOS.includes(contentType)) {
        return res.status(400).json({ message: `El Content-Type debe ser uno de: ${TIPOS_PERMITIDOS.join(", ")}` });
    }

    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        return res.status(400).json({ message: "Debés enviar la imagen en el body" });
    }

    try {
        const imagen = await subirImagen(req.body, contentType);
        res.status(201).json(imagen);
    } catch (error) {
        console.error("Error al subir imagen:", error);
        res.status(500).json({ message: "Error al subir la imagen" });
    }
}

export async function listar(req, res) {
    try {
        res.json(await listarImagenes());
    } catch (error) {
        console.error("Error al listar imágenes:", error);
        res.status(500).json({ message: "Error al listar las imágenes" });
    }
}

export async function obtenerUrl(req, res) {
    const { nombre } = req.params;

    try {
        if (!(await existeImagen(nombre))) {
            return res.status(404).json({ message: "Imagen no encontrada" });
        }
        res.json({ nombre, url: urlPublica(nombre) });
    } catch (error) {
        console.error("Error al obtener imagen:", error);
        res.status(500).json({ message: "Error al obtener la imagen" });
    }
}
