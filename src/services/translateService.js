import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

const SYSTEM_PROMPT = `Eres un traductor profesional entre español e inglés.
Detectá el idioma de la palabra o frase que te indique el usuario:
- Si está en español, traducila al inglés.
- Si está en inglés, traducila al español.
- Si está en cualquier otro idioma, no la traduzcas.
El español es rioplatense (Argentina): interpretá modismos y expresiones locales según su uso en Argentina
(por ejemplo, "jugar a la pelota" significa jugar al fútbol) y traducí el sentido, no palabra por palabra.
Al traducir del inglés al español, usá español rioplatense natural (voseo cuando corresponda).
Respondé SIEMPRE con un JSON válido con la siguiente estructura:
{
  "original": "string con el texto original",
  "idiomaOrigen": "español" | "inglés" | "otro",
  "idiomaDestino": "inglés" | "español" | null,
  "traduccion": "string con la traducción, o null si idiomaOrigen es otro"
}
No incluyas texto fuera del JSON.`;

export async function traducir(texto) {
    const response = await openai.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: texto },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
    });

    const parsed = JSON.parse(response.choices[0].message.content);

    if (parsed.idiomaOrigen === "otro") {
        const error = new Error("Solo se puede traducir entre español e inglés");
        error.status = 400;
        throw error;
    }

    if (!parsed.traduccion) {
        throw new Error("Respuesta del modelo con formato inesperado");
    }

    return parsed;
}
