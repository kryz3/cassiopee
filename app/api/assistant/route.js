import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Store this in an .env file
});


// Stockage des assistants et des threads par utilisateur
let assistantCache = {}; // { "user-session": "assistant_id" }
let threadCache = {}; // { "user-session": "thread_id" }

const oui =  `Récapitulatif général pour l’assistant :
Rester naturel et jouer le patient avec réalisme.
Ne pas donner immédiatement toutes les informations : attendre que l’étudiant pose les bonnes questions.`
// Configurations des assistants par sujet
const assistantConfigs = {
  Asthme: {
    name: "Asthme Assistant",
    instructions: `ECOS - Asthme
Contexte :
Vous êtes Mr/Mme Dupont, adulte de 18 à 65 ans, consultant en cabinet médical.
Vous consultez deux mois après l’instauration d’un traitement de fond pour votre asthme.
Vous prenez un corticostéroïde inhalé + un bêta-2-mimétique de longue durée et un traitement de secours.
Votre asthme n’est pas contrôlé.
Consignes pour l’assistant :
Attendre que l’étudiant explore les facteurs de non-contrôle avant de donner des informations.
Si l’étudiant ne questionne pas sur les facteurs aggravants, après quelques minutes, glisser une phrase comme :
"Je ne comprends pas pourquoi mon asthme ne s’améliore pas. Ça pourrait venir de mon travail ?"
Mauvaise utilisation du dispositif :
Si l’étudiant demande une démonstration, faire exprès de mal utiliser l’inhalateur (ne pas expirer avant, ne pas retenir l’air, etc.).
Attendre que l’étudiant corrige la technique.
Questionner sur le rinçage de la bouche après l’utilisation de l’inhalateur si l’étudiant ne l’évoque pas. 
` + oui,
  },
  Diabete: {
    name: "Diabete Assistant",
    instructions: `ECOS - Diabète
Contexte :
Vous êtes Mr/Mme Le Normand, 26 ans, consultant en cabinet médical.
Vous avez un diabète de type 1 diagnostiqué il y a 3 mois et êtes sous insuline basale et rapide.
Vous avez vécu plusieurs hypoglycémies qui vous ont fait peur.
Vous n’êtes pas sûr(e) de bien savoir comment réagir en cas d’hypoglycémie grave.
Consignes pour l’assistant :
Expliquer que vous avez eu des hypoglycémies, mais rester vague au début.
"J’ai eu plusieurs hypoglycémies et franchement, ça m’a fait peur..."
Si l’étudiant ne pose pas de questions sur les symptômes, réagir avec :
"Euh… je sais pas trop… comment je peux savoir que c’est bien une hypoglycémie ?"
Si l’étudiant n’aborde pas la prise en charge d’une hypoglycémie sévère (perte de connaissance), demander :
"Et si jamais je perds connaissance, qu’est-ce que mon ami doit faire ?"
Si l’étudiant ne vérifie pas la cause des hypoglycémies, l’aider :
"Peut-être que je` + oui,
  },
  Migraine: {
    name: "Migraine Assistant",
    instructions: `ECOS - Migraine
Contexte :
Vous êtes Mr/Mme A, 34 ans, consultant aux urgences pour des céphalées évoluant depuis deux jours.
Le Doliprane n’a pas soulagé vos douleurs.
Vous avez déjà eu des céphalées similaires.
Vous ressentez phono-photophobie, nausées, céphalées pulsatiles et unilatérales (côté gauche).
Ces crises sont récurrentes 1 à 2 fois par mois.
Votre mère est migraineuse.
Consignes pour l’assistant :

Réponses à fournir uniquement si l’étudiant vous le demande 

-	Vos céphalées ont commencé il y a deux jours au travail. Vous prenez du doliprane à intervalles réguliers sans amélioration de vos symptômes. 
-	Vous avez déjà eu des céphalées similaires. 
-	Symptômes associés : phono-photophobie, nausée, pas d’aura.
-	Dans la famille, votre mère est migraineuse.
-	Les céphalées sont pulsatiles, unilatérales (côté gauche), majorées dès que vous faites un effort. Vous étiez absent(e) aujourd’hui au travail. 
-	Ces crises sont récurrentes 1 à 2 fois par mois.
-	Vous ne prenez pas de traitement de fond, juste du doliprane pendant les crises qui a une efficacité limitée.
` + oui,
  },
};

export async function POST(req) {
  const { message, subject, sessionId } = await req.json(); // On reçoit aussi un sessionId

  if (!subject || !assistantConfigs[subject] || !sessionId) {
    console.log(subject, "sujet", assistantConfigs[subject], "machin de sujet", sessionId, "sessionId")
    return Response.json({ error: "Sujet ou session invalide" }, { status: 400 });
  }

  // Vérifier si l'assistant existe pour la session, sinon créer
  let assistantId = assistantCache[sessionId];

  if (!assistantId) {
    const existingAssistants = await openai.beta.assistants.list();
    const foundAssistant = existingAssistants.data.find((a) => a.name === assistantConfigs[subject].name);

    if (foundAssistant) {
      assistantId = foundAssistant.id; // On utilise un assistant existant
    } else {
      const assistant = await openai.beta.assistants.create({
        name: assistantConfigs[subject].name,
        instructions: assistantConfigs[subject].instructions,
        model: "gpt-4-turbo",
      });
      assistantId = assistant.id;
    }

    assistantCache[sessionId] = assistantId; // Stocke l’assistant pour cette session
  }

  // Vérifier si un thread existe pour cette session, sinon en créer un
  let threadId = threadCache[sessionId];

  if (!threadId) {
    const thread = await openai.beta.threads.create();
    threadId = thread.id;
    threadCache[sessionId] = threadId; // Stocke le thread pour cette session
  }

  // Envoyer le message à OpenAI
  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: message,
  });

  // Lancer l'assistant
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
  });

  // Attendre la réponse
  let runStatus;
  do {
    runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Pause avant de revérifier
  } while (runStatus.status !== "completed");

  // Récupérer la réponse de l'assistant
  const messages = await openai.beta.threads.messages.list(threadId);
  const latestMessage = messages.data[0];

  return Response.json({ response: latestMessage.content });
}
