import OpenAI from "openai";
import { assistantCache, threadCache } from "../../lib/assistantStore"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  const { subject, sessionId } = await req.json();

  try {
    const response = await fetch("http://localhost:5001/Ecos/api/getEcosPatientInstructions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: subject }),
    });

    const data = await response.json();
    const instructions0 = data.instructions || data;
    const instructions = instructions0 + "Tu es un chatbot IA, dans le cas où aucun nom ne t'est attribué, tu n'en donneras pas, et tu seras pas défaut un homme. Respecte les consignes, tu auras systématiquement affaire à un médecin et tu seras le patient. Ne donne pas les informations trop rapidement, attends qu'elles te le soient demandées, sauf celles qui te sont précisées à donner d'entrée de conversation.  " 

    const assistant = await openai.beta.assistants.create({
      name: subject,
      instructions,
      model: "gpt-4-turbo",
    });

    assistantCache[sessionId] = assistant.id;
    const thread = await openai.beta.threads.create();
    threadCache[sessionId] = thread.id;

  

    return Response.json({ assistantId: assistant.id, threadId: thread.id }, { status: 200 });
  } catch (error) {
    console.error("Erreur création assistant:", error);
    return Response.json({ error: "Erreur serveur assistant." }, { status: 500 });
  }
}
