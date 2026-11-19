# Imágenes

Endpoints para subir y listar imágenes. Las imágenes se guardan en un contenedor de Azure Blob Storage y cada una queda accesible con una URL pública.

| Endpoint | Qué hace |
|---|---|
| `POST /api/imagenes` | Sube una imagen y devuelve su URL |
| `GET /api/imagenes` | Lista todas las imágenes guardadas |
| `GET /api/imagenes/:nombre` | Devuelve la URL de una imagen |

> Por ahora ninguno requiere token.

---

## Configuración

En el `.env` tiene que estar la variable `FOTOS` con la URL del contenedor y un token SAS:

```
FOTOS=https://fotosmascotas.blob.core.windows.net/imagenes?sp=racwdl&st=...&se=...&sig=...
```

- El SAS tiene que tener al menos los permisos **Create** y **Write** (`c` y `w` en `sp=`). Si solo tiene **Read** (`sp=r`), la subida falla con un error 500.
- El SAS vence en la fecha que indica `se=`. Después de esa fecha la subida deja de funcionar y hay que generar uno nuevo.
- El contenedor tiene acceso anónimo habilitado, así que listar y ver las imágenes no usa el SAS.

---

## `POST /api/imagenes`

Sube una imagen. El body es **el archivo crudo**, no JSON ni `multipart/form-data`.

**Headers**

| Header | Valor |
|---|---|
| `Content-Type` | `image/jpeg`, `image/png`, `image/gif` o `image/webp` |

Tamaño máximo: **10 MB**. El nombre se genera automáticamente (un UUID con la extensión según el tipo).

**Ejemplo con curl**

```bash
curl -X POST -H "Content-Type: image/jpeg" --data-binary @foto.jpg http://localhost:3001/api/imagenes
```

**En Postman:** Body → **binary** → elegir el archivo, y en Headers poner `Content-Type: image/jpeg` (o el tipo que corresponda).

**Respuesta 201**

```json
{
  "nombre": "3635d629-ded0-483c-8bc4-4435c832d052.png",
  "url": "https://fotosmascotas.blob.core.windows.net/imagenes/3635d629-ded0-483c-8bc4-4435c832d052.png"
}
```

**Errores**

| Status | Motivo |
|---|---|
| 400 | El `Content-Type` no es un tipo de imagen permitido |
| 400 | El body está vacío |
| 413 | La imagen pesa más de 10 MB |
| 500 | Error al subir a Azure (por ejemplo, SAS vencido o sin permisos de escritura) |

---

## `GET /api/imagenes`

Lista todas las imágenes del contenedor.

**Respuesta 200**

```json
[
  {
    "nombre": "3635d629-ded0-483c-8bc4-4435c832d052.png",
    "url": "https://fotosmascotas.blob.core.windows.net/imagenes/3635d629-ded0-483c-8bc4-4435c832d052.png",
    "tipo": "image/png",
    "tamanio": 69,
    "fecha": "Thu, 19 Nov 2026 23:12:22 GMT"
  }
]
```

| Campo | Descripción |
|---|---|
| `nombre` | Nombre del archivo en el contenedor |
| `url` | URL pública de la imagen |
| `tipo` | Tipo de la imagen |
| `tamanio` | Tamaño en bytes |
| `fecha` | Fecha de la última modificación |

**Errores**

| Status | Motivo |
|---|---|
| 500 | Error al consultar Azure |

---

## `GET /api/imagenes/:nombre`

Devuelve la URL de una imagen a partir de su nombre.

```
GET /api/imagenes/3635d629-ded0-483c-8bc4-4435c832d052.png
```

**Respuesta 200**

```json
{
  "nombre": "3635d629-ded0-483c-8bc4-4435c832d052.png",
  "url": "https://fotosmascotas.blob.core.windows.net/imagenes/3635d629-ded0-483c-8bc4-4435c832d052.png"
}
```

**Errores**

| Status | Motivo |
|---|---|
| 404 | No existe una imagen con ese nombre |
| 500 | Error al consultar Azure |

---

## Uso desde el frontend

Ejemplos con `fetch`, que sirven para cualquier framework (React, Vue o JS puro).

```js
const API = "http://localhost:3001/api";
```

### Subir una imagen desde un `<input type="file">`

Un `File` se puede mandar directo como body, y su `type` sirve como `Content-Type`:

```js
async function subirImagen(file) {
  const res = await fetch(`${API}/imagenes`, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data; // { nombre, url }
}
```

### Listar imágenes

```js
async function listarImagenes() {
  const res = await fetch(`${API}/imagenes`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data; // [{ nombre, url, tipo, tamanio, fecha }]
}
```

### Ejemplo en React: subir y mostrar la galería

```jsx
import { useEffect, useState } from "react";

function Galeria() {
  const [imagenes, setImagenes] = useState([]);

  useEffect(() => {
    listarImagenes().then(setImagenes);
  }, []);

  const onChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const nueva = await subirImagen(file);
    setImagenes((prev) => [...prev, nueva]);
  };

  return (
    <div>
      <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={onChange} />
      {imagenes.map((img) => (
        <img key={img.nombre} src={img.url} alt={img.nombre} width={150} />
      ))}
    </div>
  );
}
```

### A tener en cuenta

- La `url` que devuelve el back se puede usar directo en un `<img src>`, porque el contenedor es público.
- Para asociar una imagen a otra entidad (por ejemplo, un plan o un usuario), conviene guardar la `url` o el `nombre` que devuelve la subida.
- En los errores, el mensaje viene en el campo `message` de la respuesta JSON.
