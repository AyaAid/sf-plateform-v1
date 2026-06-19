import { Router } from "express";
import Groq from "groq-sdk";
import { requireAuth } from "../middleware/requireAuth";

export const aiRouter = Router();
aiRouter.use(requireAuth);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY, timeout: 5000 });

aiRouter.post("/feedback", async (req, res) => {
  const {
    type,
    question,
    userAnswer,
    expectedPoints,
    sampleAnswer,
    caseText,
    questions,
    correction,
    chapterTitle,
    score,
    answeredCount,
    totalInteractive,
  } = req.body as {
    type: "quiz-text" | "case-study" | "module-recap";
    question?: string;
    userAnswer?: string | string[];
    expectedPoints?: string[];
    sampleAnswer?: string;
    caseText?: string;
    questions?: string[];
    correction?: string;
    chapterTitle?: string;
    score?: number;
    answeredCount?: number;
    totalInteractive?: number;
  };

  let prompt: string;

  if (type === "module-recap") {
    const hasInteractive = (totalInteractive ?? 0) > 0;
    const perfDesc = !hasInteractive
      ? "module sans exercices interactifs (lecture seule)"
      : `${answeredCount}/${totalInteractive} exercices complétés, score de ${score}/100`;

    prompt = `Tu es un tuteur pédagogique de la Stars Factory, une académie de formation spatiale.

L'apprenant vient de terminer le module : "${chapterTitle}"
Performance : ${perfDesc}

Écris un message de fin de module en 2-3 phrases, en français :
- Adapte le ton selon la performance (excellent/bien/peut mieux faire)
- Rappelle brièvement l'enjeu du module (sans le répéter mot pour mot)
- Motive pour la suite de la formation

Sois direct, chaleureux, sans intro type "Voici mon message :".`;

  } else if (type === "quiz-text") {
    prompt = `Tu es un tuteur pédagogique expert. L'apprenant vient de répondre à une question ouverte.

Question : ${question}
Points clés attendus :
${(expectedPoints ?? []).map((p) => `- ${p}`).join("\n")}
Exemple de bonne réponse : ${sampleAnswer}
Réponse de l'apprenant : ${userAnswer as string}

Donne un feedback personnalisé en 3-4 phrases maximum, en français. Sois direct, sans intro type "Feedback :".
- Si la réponse est bonne : félicite et ajoute un point complémentaire intéressant.
- Si partielle : reconnais ce qui est juste et indique précisément ce qui manque.
- Si incorrecte : reste encourageant et explique ce qu'il fallait retenir.`;

  } else if (type === "case-study") {
    const answers = userAnswer as string[];
    const answersText = (questions ?? [])
      .map((q, i) => `Question ${i + 1} : ${q}\nRéponse : ${answers[i] ?? "(pas de réponse)"}`)
      .join("\n\n");

    prompt = `Tu es un tuteur pédagogique expert. L'apprenant vient de répondre à une étude de cas.

Contexte : ${caseText}

${answersText}

Correction de référence : ${correction}

Donne un feedback global personnalisé en 4-5 phrases maximum, en français. Sois direct, sans intro.
Mets en valeur ce qui est bien compris, signale les lacunes ou erreurs, et reste encourageant et pédagogique.`;

  } else {
    return res.json({ feedback: null });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 350,
      temperature: 0.6,
    });

    const feedback = completion.choices[0]?.message?.content?.trim() ?? null;
    return res.json({ feedback });
  } catch {
    return res.json({ feedback: null });
  }
});
