import crypto from "crypto";

// FOTOS = URL del contenedor con SAS (ej: https://cuenta.blob.core.windows.net/imagenes?sp=...&sig=...)
function getContenedor() {
    const [base, sas = ""] = process.env.FOTOS.split("?");
    return { base: base.replace(/\/$/, ""), sas };
}

const EXTENSIONES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
};

export const TIPOS_PERMITIDOS = Object.keys(EXTENSIONES);

export function urlPublica(nombre) {
    return `${getContenedor().base}/${encodeURIComponent(nombre)}`;
}

export async function subirImagen(buffer, contentType) {
    const { sas } = getContenedor();
    const nombre = `${crypto.randomUUID()}.${EXTENSIONES[contentType]}`;
    const url = urlPublica(nombre);

    // Subir requiere un SAS con permiso de escritura (sp con c/w); el acceso anónimo es solo lectura
    const response = await fetch(`${url}?${sas}`, {
        method: "PUT",
        headers: {
            "x-ms-blob-type": "BlockBlob",
            "Content-Type": contentType,
        },
        body: buffer,
    });

    if (!response.ok) {
        const detalle = await response.text();
        throw new Error(`Azure respondió ${response.status}: ${detalle}`);
    }

    return { nombre, url };
}

export async function listarImagenes() {
    const { base } = getContenedor();
    // El listado usa el acceso anónimo del contenedor
    const response = await fetch(`${base}?restype=container&comp=list`);

    if (!response.ok) {
        throw new Error(`Azure respondió ${response.status}: ${await response.text()}`);
    }

    const xml = await response.text();
    const blobs = [...xml.matchAll(/<Blob>([\s\S]*?)<\/Blob>/g)].map(([, blob]) => {
        const nombre = blob.match(/<Name>(.*?)<\/Name>/)?.[1];
        const tamanio = Number(blob.match(/<Content-Length>(.*?)<\/Content-Length>/)?.[1] ?? 0);
        const tipo = blob.match(/<Content-Type>(.*?)<\/Content-Type>/)?.[1] ?? null;
        const fecha = blob.match(/<Last-Modified>(.*?)<\/Last-Modified>/)?.[1] ?? null;
        return { nombre, url: urlPublica(nombre), tipo, tamanio, fecha };
    });

    return blobs;
}

export async function existeImagen(nombre) {
    const response = await fetch(urlPublica(nombre), { method: "HEAD" });
    return response.ok;
}
