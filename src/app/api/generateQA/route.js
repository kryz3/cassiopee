import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.KEY_OPENAI });

export async function GET() {
  try {
    const response = await fetch("http://localhost:5001/QA/api/getQAs");
    
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    const filteredQAs = data.map(({ question, answer }) => ({ question, answer }));
 
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "Tu es un professeur en médecine. Tu proposes des questions à tes étudiants pour qu'ils s'entraînent, ainsi qu'une réponse détaillée qui suit tous les points du barème. Va directement au but, annonce la question sans introduire ton intervention. La première ligne doit être de la formule SUJET - TYPE (exemple de type: QCM, question ouverte). Ton texte sera interprété en html donc utilise la bonne syntaxe",
          },
          {
            role: "user",
            content: "Invente une question en te basant sur les questions déjà connues suivantes :\n\n",
          },
          {
            role: "assistant",
            content: JSON.stringify(filteredQAs)
          }
        ],
      });
      return new Response(completion.choices[0]?.message?.content, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({error: error.message}))
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

