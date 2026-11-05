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

## Estructura del proyecto

```
back-planazo/
├── src/
│   ├── app.js
│   ├── controllers/
│   │   ├── planController.js
│   │   ├── salaController.js
│   │   └── userController.js
│   ├── data/
│   │   ├── connection.js
│   │   ├── planData.js
│   │   ├── salaData.js
│   │   └── userData.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── planRoutes.js
│   │   ├── salaRoutes.js
│   │   └── userRoutes.js
│   └── services/
│       ├── planService.js
│       ├── salaService.js
│       └── userService.js
├── .env
├── package.json
└── README.md
```

---

## Endpoints

> 🔒 = requiere header `Authorization: Bearer <token>`

---

### Usuarios — `/api/users`

| Método | Endpoint | Parámetros | Requiere token | Descripción |
|--------|----------|------------|:--------------:|-------------|
| `POST` | `/api/users/register` | **Body:** `name`, `email`, `password`, `fechaNacimiento` | No | Registra un nuevo usuario |
| `POST` | `/api/users/login` | **Body:** `email`, `password` | No | Inicia sesión y devuelve un JWT |
| `GET` | `/api/users/` | — | 🔒 Sí | Devuelve todos los usuarios registrados |
| `GET` | `/api/users/:id` | **Param:** `id` (ObjectId del usuario) | 🔒 Sí | Devuelve un usuario por su ID |
| `PUT` | `/api/users/agregarPreferencias/:id` | **Param:** `id` · **Body:** `preferencias` (string[]) | No | Agrega preferencias al perfil del usuario |

#### `POST /api/users/register`

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "miPassword123",
  "fechaNacimiento": "2000-05-15"
}
```

**Respuesta:**
```json
{
  "message": "Usuario registrado exitosamente",
  "userId": "<ObjectId>"
}
```

---

#### `POST /api/users/login`

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

### Salas — `/api/salas`

| Método | Endpoint | Parámetros | Requiere token | Descripción |
|--------|----------|------------|:--------------:|-------------|
| `GET` | `/api/salas/` | — | 🔒 Sí | Devuelve todas las salas |
| `POST` | `/api/salas/crearSala` | **Body:** `idHost`, `nombre`, `tipoAct`, `intereses`, `restricciones`, `ubicacion`, `fecha`, `hora`, `presupuesto` | 🔒 Sí | Crea una nueva sala |
| `GET` | `/api/salas/:id` | **Param:** `id` (ObjectId de la sala) | No | Devuelve una sala por su ID |
| `DELETE` | `/api/salas/borrarSala/:id` | **Param:** `id` (ObjectId de la sala) | 🔒 Sí | Elimina una sala |
| `PUT` | `/api/salas/agregarParticipante/:id` | **Param:** `id` · **Body:** `idParticipante` | 🔒 Sí | Agrega un participante a la sala |
| `PUT` | `/api/salas/sugerir/:id` | **Param:** `id` (ObjectId de la sala) | 🔒 Sí | Genera planes con IA y los agrega a la sala |
| `GET` | `/api/salas/obtenerPlanes/:id` | **Param:** `id` (ObjectId de la sala) | 🔒 Sí | Devuelve los planes sugeridos de la sala |
| `PUT` | `/api/salas/:idSala/votarPlan/:idPlan` | **Param:** `idSala`, `idPlan` | 🔒 Sí | Registra un voto para un plan sugerido |
| `PUT` | `/api/salas/planGanador/:id` | **Param:** `id` (ObjectId de la sala) | No | Determina el plan ganador por votos y lo guarda en el historial de cada participante |

#### `POST /api/salas/crearSala`

**Body:**
```json
{
  "idHost": "<ObjectId del usuario>",
  "nombre": "Noche de viernes",
  "tipoAct": "música en vivo",
  "intereses": ["cerveza artesanal", "baile"],
  "restricciones": ["vegetariano"],
  "ubicacion": "Palermo",
  "fecha": "2026-07-05",
  "hora": "21:00",
  "presupuesto": "medio"
}
```

**Respuesta:**
```json
{
  "message": "Sala creada exitosamente",
  "salaId": "<ObjectId>"
}
```

---

### Planes — `/api/plans`

| Método | Endpoint | Parámetros | Requiere token | Descripción |
|--------|----------|------------|:--------------:|-------------|
| `POST` | `/api/plans/suggest` | **Body:** ver tabla de campos | 🔒 Sí | Genera 5 sugerencias de planes usando IA |
| `GET` | `/api/plans/historial` | — | 🔒 Sí | Devuelve el historial de consultas del usuario autenticado |

#### `POST /api/plans/suggest`

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `cantidadPersonas` | number | No | Total de personas del grupo |
| `preferencias` | string[] | No | Ej: `["música en vivo", "aire libre"]` |
| `restriccionesComida` | string[] | No | Ej: `["vegetariano", "sin gluten"]` |
| `presupuesto` | string | No | `"bajo"`, `"medio"` o `"alto"` |
| `zona` | string | No | Zona preferida, ej: `"Palermo"` |
| `disponibilidad` | string | No | Ej: `"noche del sábado"` |
| `edadPromedio` | number | No | Edad promedio del grupo |

**Ejemplo:**
```json
{
  "cantidadPersonas": 5,
  "preferencias": ["música en vivo", "cerveza artesanal"],
  "restriccionesComida": ["vegetariano"],
  "presupuesto": "medio",
  "zona": "Palermo",
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

**Respuesta:**
```json
{
  "historial": [
    {
      "_id": "...",
      "userId": "...",
      "input": { "..." : "..." },
      "planes": [ "..." ],
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```
