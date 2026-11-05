# Traductor y texto a audio

Dos endpoints que usan modelos de [Groq](https://console.groq.com):

| Endpoint | Qué hace | Modelo |
|---|---|---|
| `POST /api/translate` 🔒 | Traduce de español a inglés y de inglés a español | `openai/gpt-oss-20b` |
| `POST /api/tts` 🔒 | Convierte un texto en inglés a audio WAV | `canopylabs/orpheus-v1-english` |

> 🔒 = requiere header `Authorization: Bearer <token>` (el token que devuelve el login).

---

## Levantar el back

```bash
npm run start-dev
```

Queda escuchando en `http://localhost:3001`. Ya tiene `cors()` activado, así que el front puede llamarlo desde otro puerto.

> El modelo de audio de Groq requiere que el admin de la organización acepte sus términos una sola vez en
> https://console.groq.com/playground?model=canopylabs%2Forpheus-v1-english

---

## `POST /api/translate` 🔒

Detecta automáticamente el idioma del texto:

- Si está en **español**, lo traduce al **inglés**.
- Si está en **inglés**, lo traduce al **español** (rioplatense, con voseo).
- Si está en **otro idioma**, devuelve error 400.

Interpreta modismos argentinos y traduce el sentido, no palabra por palabra (por ejemplo, "jugar a la pelota" se traduce como "play soccer").

**Body**

```json
{ "texto": "quiero jugar a la pelota el sabado" }
```

**Respuesta 200**

```json
{
  "original": "quiero jugar a la pelota el sabado",
  "idiomaOrigen": "español",
  "idiomaDestino": "inglés",
  "traduccion": "I want to play soccer on Saturday."
}
```

**Errores**

| Status | Motivo |
|---|---|
| 400 | Falta `texto` |
| 400 | El texto no está en español ni en inglés |
| 401 | Token faltante o inválido |
| 500 | Error al llamar al modelo |

---

## `POST /api/tts` 🔒

Convierte un texto **en inglés** a audio.

**Body**

```json
{ "texto": "I want to play soccer on Saturday.", "voz": "hannah" }
```

| Campo | Requerido | Descripción |
|---|---|---|
| `texto` | Sí | Texto en inglés |
| `voz` | No | `autumn`, `diana`, `hannah`, `austin`, `daniel` o `troy`. Por defecto: `troy` |

**Respuesta 200**

El archivo de audio directo, no JSON (`Content-Type: audio/wav`, mono, 24 kHz). En Postman se puede escuchar desde la pestaña de respuesta.

**Errores**

| Status | Motivo |
|---|---|
| 400 | Falta `texto` |
| 400 | La voz no es válida |
| 401 | Token faltante o inválido |
| 500 | Error al generar el audio |

---

## Uso desde el frontend

Ejemplos con `fetch`, que sirven para cualquier framework (React, Vue o JS puro).

### Helper común

```js
const API = "http://localhost:3001/api";

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}
```

> Ajustar `localStorage.getItem("token")` según dónde guarde el token el front.

### Traducir

```js
async function traducir(texto) {
  const res = await fetch(`${API}/translate`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ texto }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data; // { original, idiomaOrigen, idiomaDestino, traduccion }
}
```

### Reproducir audio

Como el endpoint devuelve un archivo y no JSON, la respuesta se lee con `res.blob()`:

```js
async function reproducirAudio(texto, voz = "troy") {
  const res = await fetch(`${API}/tts`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ texto, voz }),
  });
  if (!res.ok) throw new Error((await res.json()).message);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.onended = () => URL.revokeObjectURL(url);
  await audio.play();
}
```

### Ejemplo en React: traducir y escuchar en inglés

```jsx
import { useState } from "react";

function Traductor() {
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState(null);

  const onTraducir = async () => setResultado(await traducir(texto));

  const textoEnIngles =
    resultado?.idiomaDestino === "inglés" ? resultado.traduccion : resultado?.original;

  return (
    <div>
      <input value={texto} onChange={(e) => setTexto(e.target.value)} />
      <button onClick={onTraducir}>Traducir</button>
      {resultado && (
        <>
          <p>{resultado.traduccion}</p>
          <button onClick={() => reproducirAudio(textoEnIngles)}>🔊 Escuchar en inglés</button>
        </>
      )}
    </div>
  );
}
```

### A tener en cuenta

- Los navegadores solo permiten `audio.play()` después de una acción del usuario (por ejemplo, un click). Por eso se reproduce desde un botón.
- En los errores, el mensaje viene en el campo `message` de la respuesta JSON.
