import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

const SYSTEM_PROMPT = `Eres un experto en planes de salida en Buenos Aires, Argentina. 
Tu tarea es sugerir exactamente 5 planes creativos, variados y concretos para un grupo de amigos, 
adaptados a sus características. Todos los planes deben ser realizables en Buenos Aires (barrios reales, 
tipos de lugares reales). 
Respondé SIEMPRE con un JSON válido con la siguiente estructura:
{
  "planes": [
    {
      "titulo": "string corto y atractivo",
      "descripcion": "string de 2-3 oraciones describiendo la experiencia",
      "tipo": "string (ej: gastronomía, cultura, aire libre, noche, deporte, etc.)",
      "barrio": "string con barrio/zona de Buenos Aires",
      "direccion": "string con la dirección del lugar (calle y número si es posible, o referencia concreta) o null si no aplica",
      "costoEstimado": "string (ej: $, $$, $$$)",
      "duracionEstimada": "string (ej: 2-3 horas)",
      "aptoPara": "string describiendo para quién es ideal"
    }
  ]
}
No incluyas texto fuera del JSON.`;

function buildUserPrompt(datos) {
    const {
        cantidadPersonas,
        preferencias = [],
        restriccionesComida = [],
        presupuesto,
        zona,
        disponibilidad,
        edadPromedio,
    } = datos;

    const total = cantidadPersonas;
    const composicion = `${total} personas`;

    const lines = [
        `Grupo: ${composicion}.`,
        edadPromedio ? `Edad promedio: ${edadPromedio} años.` : null,
        preferencias.length
            ? `Preferencias: ${preferencias.join(", ")}.`
            : null,
        restriccionesComida.length
            ? `Restricciones alimentarias: ${restriccionesComida.join(", ")}.`
            : null,
        `Presupuesto: ${presupuesto}.`,
        `Zona preferida: ${zona}.`,
        `Disponibilidad: ${disponibilidad}.`,
    ]
        .filter(Boolean)
        .join("\n");

    return `Sugerí 5 planes para el siguiente grupo en Buenos Aires:\n\n${lines}`;
}

export async function generarSugerencias(datos) {
    const userPrompt = buildUserPrompt(datos);

    const response = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);

    if (!parsed.planes || !Array.isArray(parsed.planes)) {
        throw new Error("Respuesta del modelo con formato inesperado");
    }

    return parsed.planes;
}
