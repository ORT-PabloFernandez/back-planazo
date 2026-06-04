# Planazo Backend

API REST para generar sugerencias de planes para salir con amigos en Buenos Aires, usando un modelo de lenguaje (Groq / LLaMA 3.3).

## Requisitos

- Node.js 18+
- MongoDB Atlas (o instancia local)
- Cuenta en [console.groq.com](https://console.groq.com) para obtener la API key gratuita

## Instalación

```bash
npm install
```

## Variables de entorno

Completar el archivo `.env` en la raíz del proyecto:

```env
PORT=3001
MONGODB_URI=<tu connection string de MongoDB>
JWT_SECRET=<string secreto para firmar los tokens>
GROQ_API_KEY=<tu API key de Groq>
```

## Correr el servidor

```bash
npm run start-dev
```

El servidor queda escuchando en `http://localhost:3001`.

---

## Endpoints

### Autenticación

#### `POST /api/users/register`
Registra un nuevo usuario.

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "miPassword123"
}
```

---

#### `POST /api/users/login`
Inicia sesión y devuelve un JWT.

**Body:**
```json
{
  "email": "juan@ejemplo.com",
  "password": "miPassword123"
}
```

**Respuesta:**
```json
{
  "message": "Login exitoso",
  "user": { "_id": "...", "name": "...", "email": "..." },
  "token": "<JWT>"
}
```

---

#### `GET /api/users/` 🔒
Devuelve todos los usuarios registrados. Requiere token JWT.

---

### Planes

Todos los endpoints de planes requieren el header:
```
Authorization: Bearer <token>
```

---

#### `POST /api/plans/suggest` 🔒
Genera 5 sugerencias de planes para el grupo usando IA.

**Body:**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `cantidadPersonas` | number | Si no se envían los siguientes dos | Total de personas |
| `cantidadChicos` | number | Si no se envía el anterior | Cantidad de chicos |
| `cantidadChicas` | number | Si no se envía `cantidadPersonas` | Cantidad de chicas |
| `preferencias` | string[] | No | Ej: `["música en vivo", "aire libre"]` |
| `restriccionesComida` | string[] | No | Ej: `["vegetariano", "sin gluten"]` |
| `presupuesto` | string | No | `"bajo"`, `"medio"` o `"alto"` |
| `zona` | string | No | Zona preferida, ej: `"Palermo"` |
| `ubicacion` | string | No | Ubicación actual del grupo para priorizar cercanía |
| `disponibilidad` | string | No | Ej: `"noche del sábado"` |
| `edadPromedio` | number | No | Edad promedio del grupo |

**Ejemplo:**
```json
{
  "cantidadChicos": 3,
  "cantidadChicas": 2,
  "preferencias": ["música en vivo", "cerveza artesanal"],
  "restriccionesComida": ["vegetariano"],
  "presupuesto": "medio",
  "zona": "Palermo",
  "ubicacion": "Av. Santa Fe y Callao, Buenos Aires",
  "disponibilidad": "noche del sábado",
  "edadPromedio": 25
}
```

**Respuesta:**
```json
{
  "planes": [
    {
      "titulo": "Niceto Club",
      "descripcion": "...",
      "tipo": "música en vivo",
      "barrio": "Palermo",
      "direccion": "Niceto Vega 5510",
      "costoEstimado": "$$",
      "duracionEstimada": "4-5 horas",
      "aptoPara": "jóvenes amantes de la música"
    }
  ]
}
```

---

#### `GET /api/plans/historial` 🔒
Devuelve el historial de consultas del usuario autenticado.

**Respuesta:**
```json
{
  "historial": [
    {
      "_id": "...",
      "userId": "...",
      "input": { ... },
      "planes": [ ... ],
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```
