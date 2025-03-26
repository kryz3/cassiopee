import OpenAI from "openai";

export const dynamic = "force-dynamic"; // ensures serverless works as expected

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { message, assistantId, threadId } = await req.json();

    console.log("🧠 Assistant received", { assistantId, threadId });

    if (!assistantId || !threadId || !message) {
      return Response.json({ error: "Assistant non initialisé ou message manquant" }, { status: 400 });
    }

    // 1. Add the user message to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });

    // 2. Run the assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    // 3. Poll until the run is completed
    let runStatus;
    do {
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } while (runStatus.status !== "completed");

    // 4. Get the assistant's reply
    const messages = await openai.beta.threads.messages.list(threadId);
    const latestMessage = messages.data[0];

    return Response.json({ response: latestMessage.content }, { status: 200 });

  } catch (error) {
    console.error("❌ Error in assistant route:", error);
    return Response.json({ error: "Erreur serveur assistant" }, { status: 500 });
  }
}
