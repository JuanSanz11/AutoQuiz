script.js
let questions = [];

document.getElementById("generateBtn").addEventListener("click", async () => {
  const file = document.getElementById("fileInput").files[0];
  if (!file) return alert("Selecciona un archivo primero");

  const text = await extractTextFromFile(file);
  questions = await generateSmartQuestions(text, 5);
  renderQuiz(questions);
});

async function extractTextFromFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  const arrayBuffer = await file.arrayBuffer();

  if (ext === "pdf") {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(" ") + " ";
    }
    return text;
  } else if (ext === "docx") {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } else if (ext === "txt") {
    return await file.text();
  } else {
    alert("Formato no soportado");
    return "";
  }
}

// Simulación de IA: Genera preguntas con opciones y respuesta correcta
async function generateSmartQuestions(text, count) {
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
  const selected = sentences.sort(() => 0.5 - Math.random()).slice(0, count);

  return selected.map((sentence, i) => {
    const correct = `Interpretación correcta de: "${sentence.trim().slice(0, 60)}..."`;
    const options = shuffle([
      correct,
      "Interpretación incorrecta 1",
      "Interpretación incorrecta 2",
      "Interpretación incorrecta 3"
    ]);
    return {
      question: `¿Cuál es la mejor interpretación de esta frase?: "${sentence.trim()}"`,
      options,
      correctIndex: options.indexOf(correct)
    };
  });
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function renderQuiz(questions) {
  const container = document.getElementById("quizContainer");
  container.innerHTML = "";

  questions.forEach((q, i) => {
    const div = document.createElement("div");
    div.className = "question";
    div.innerHTML = `
      <p><strong>Pregunta ${i + 1}:</strong> ${q.question}</p>
      ${q.options.map((opt, idx) => `
        <label>
          <input type="radio" name="q${i}" value="${idx}" />
          ${opt}
        </label><br/>
      `).join("")}
      <button onclick="checkAnswer(${i})">Verificar</button>
      <div id="feedback${i}"></div>
    `;
    container.appendChild(div);
  });
}

function checkAnswer(index) {
  const selected = document.querySelector(`input[name="q${index}"]:checked`);
  const feedback = document.getElementById(`feedback${index}`);
  const correct = questions[index].correctIndex;

  if (!selected) {
    feedback.innerHTML = "<span style='color: red;'>Selecciona una opción.</span>";
    return;
  }

  const radios = document.getElementsByName(`q${index}`);
  radios.forEach((radio, i) => {
    const label = radio.parentElement;
    if (i === correct) {
      label.style.color = "green";
      label.style.fontWeight = "bold";
    } else {
      label.style.color = "gray";
    }
  });

  if (parseInt(selected.value) === correct) {
    feedback.innerHTML = "<span style='color: green;'>¡Correcto!</span>";
  } else {
    feedback.innerHTML = "<span style='color: red;'>Incorrecto. La respuesta correcta está marcada en verde.</span>";
  }
}

