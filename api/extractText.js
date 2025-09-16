// api/generateQuiz.js
export default async function handler(req, res) {
  const { text, count } = req.body;

  const prompt = `
Genera ${count} preguntas tipo quiz con 4 opciones cada una basadas en el siguiente texto. Devuelve un JSON con:
[
  {
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correctIndex": 0
  },
  ...
]
Texto:
${text}
`;

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
  const content = data.choices[0].message.content;

  try {
    const quiz = JSON.parse(content);
    res.status(200).json(quiz);
  } catch (err) {
    res.status(500).json({ error: "Error al parsear la respuesta de la IA" });
  }
}
