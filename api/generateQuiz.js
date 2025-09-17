export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { text, count } = req.body;

  if (!text || !count) {
    return res.status(400).json({ error: "Faltan parámetros: text y count" });
  }

  const prompt = `
Genera ${count} preguntas tipo quiz con 4 opciones cada una basadas en el siguiente texto. Devuelve un JSON con este formato:

[
  {
    "question": "¿Cuál es el tema principal del texto?",
    "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
    "correctIndex": 2
  },
  ...
]

No expliques nada. Devuelve solo el JSON, sin comentarios ni texto adicional.

Texto:
${text}
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error("Respuesta inesperada de OpenAI:", data);
      return res.status(500).json({ error: "Respuesta inesperada de OpenAI" });
    }

    const content = data.choices[0].message.content.trim();

    try {
      const quiz = JSON.parse(content);
      res.status(200).json(quiz);
    } catch (parseError) {
      console.error("No se pudo parsear el contenido:", content);
      res.status(500).json({ error: "La respuesta de OpenAI no es JSON válido", raw: content });
    }
  } catch (error) {
    console.error("Error al generar el quiz:", error);
    res.status(500).json({ error: "Error al generar el quiz con OpenAI" });
  }
}
