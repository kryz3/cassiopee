import OpenAI from "openai";
import { assistantCache, threadCache } from "../../lib/assistantStore"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  const { subject, sessionId } = await req.json();
  console.log(subject, sessionId, "ssesion id subject");

  try {
    const response = await fetch("http://localhost:5001/Ecos/api/getEcosPatientInstructions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: subject }),
    });

    const data = await response.json();
    const instructions = data.instructions || data;

    const assistant = await openai.beta.assistants.create({
      name: subject,
      instructions,
      model: "gpt-4-turbo",
    });

    assistantCache[sessionId] = assistant.id;
    const thread = await openai.beta.threads.create();
    threadCache[sessionId] = thread.id;

    console.log("✅ Assistant initialized:", {
      sessionId,
      assistantId: assistant.id,
      threadId: thread.id,
    });

    return Response.json({ assistantId: assistant.id, threadId: thread.id }, { status: 200 });
  } catch (error) {
    console.error("Erreur création assistant:", error);
    return Response.json({ error: "Erreur serveur assistant." }, { status: 500 });
  }
}
