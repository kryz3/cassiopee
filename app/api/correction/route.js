import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { messages, sujet } = await req.json();
 

    if (!messages || messages.length === 0) {
      return Response.json({ error: "Aucun message à corriger." }, { status: 400 });
    }

    const userMessage = messages.find(msg => msg.role === "user");
    if (!userMessage) {
      return Response.json({ error: "Aucun message utilisateur trouvé." }, { status: 400 });
    }

    if (!sujet) {
      return Response.json({ error: "Sujet non fourni pour la récupération de la grille." }, { status: 400 });
    }

    // Appel API pour récupérer la grille de correction
    const gridRes = await fetch("http://157.159.116.203:5001/Ecos/api/getEcosGrid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: sujet }),
    });


    if (!gridRes.ok) {
      return Response.json({ error: "Erreur lors de la récupération de la grille." }, { status: 500 });
    }

    const gridData = await gridRes.json();
    const ecosGrid = gridData?.instructions;

    

    // Formatage de la grille pour l’intégrer au prompt
    const grilleEvaluationString = ecosGrid
      .map(item => `"${item.consigne}" (${item.note} pts)`)
      .join("\n");

    const formattedMessages = messages
      .map(msg => `${msg.role === "user" ? "Utilisateur" : "Assistant"}: ${msg.content}`)
      .join("\n");

    // Appel à OpenAI avec la grille formatée
    const assistantResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `Tu es médecin examinateur et tu dois évaluer un étudiant à partir de la grille suivante :
${grilleEvaluationString}
Tu dois noter chaque item de la grille un par un, même s’il n’a pas été réalisé ou mentionné. Le nombre total d’items peut varier (ce n’est pas toujours 15).
Pour chaque ligne, utilise exactement ce format :
1. Nom de l’item : Oui (1 pt) \n
ou
2. Nom de l’item : Non réalisé correctement (0 pt) \n
ou
3. Nom de l’item : Non mentionné (0 pt) \n
À la fin, affiche :
<br />\n
<strong>Total des points : X/Y </strong>\n
(où X = nombre de points obtenus, Y = total des points possibles, selon la grille fournie)
🔸 Ensuite, évalue les 4 critères suivants sous le titre : <br />\n<strong>Communication et attitudes </strong>\n
Pour chaque critère, indique le niveau et une courte justification.
Utilise le barème ci-dessous :
APTITUDE À ÉCOUTER
0 : Interrompt / ignore
0.25 : Impatient
0.5 : Attentif aux réponses
0.75 : Reformule si imprécis
1 : Écoute soutenue, préoccupations prises en compte
APTITUDE À QUESTIONNER
0 : Questions fermées/jargon
0.25 : S’éloigne des objectifs / jargon mal expliqué
0.5 : Questions variées / jargon expliqué
0.75 : Questions précises, langage adapté
1 : Assuré, pertinent
APTITUDE À STRUCTURER / MENER L’ENTREVUE
0 : Désordonné
0.25 : Peu structuré
0.5 : Centré, essentiels abordés
0.75 : Logique et efficace
1 : Approche intégrée
APTITUDE À FOURNIR LES RENSEIGNEMENTS AU PATIENT
0 : Informations erronées ou absentes
0.25 : Incomplètes / peu pertinentes
0.5 : Adaptées mais compréhension peu vérifiée
0.75 : Claires et vérifiées
1 : Justes, illustrées, parfaitement comprises
🔹 Enfin, évalue la performance globale sous : <br />\n<strong>Performance globale</strong>\n
Utilise ce barème :
0 : Très au-dessous des attentes
0.25 : Limite
0.5 : Satisfaisante
0.75 : Très satisfaisante
1 : Remarquable
Et ajoute une phrase de justification.
❗ Respecte scrupuleusement le format d’exemple suivant avec les balises <strong> et tous les \n de retour à la ligne.
🔽 EXEMPLE DE SORTIE ATTENDUE :
Présentation au patient : Oui (1 pt) \n
Identification du motif de consultation : Oui (1 pt) \n
Questionnement sur les antécédents : Non mentionné (0 pt) \n
Recherche des signes associés : Oui (1 pt) \n
Recherche des facteurs déclenchants : Oui (1 pt) \n
Recherche de la chronologie des symptômes : Oui (1 pt) \n
Interrogatoire sur les traitements déjà pris : Non réalisé correctement (0 pt) \n
Recherche de signes de gravité : Non mentionné (0 pt) \n
Examen physique ciblé : Oui (1 pt) \n
Prise en compte du contexte psychosocial : Non mentionné (0 pt) \n
Reformulation des propos du patient : Non réalisé correctement (0 pt) \n
Structuration de l’entretien : Oui (1 pt) \n
Explication du diagnostic présumé : Non mentionné (0 pt) \n
Proposition d’un plan de prise en charge : Oui (1 pt) \n
Vérification de la compréhension du patient : Non mentionné (0 pt) \n
<br />\n
<strong>Total des points : 8/15 </strong>\n
<br />\n
<strong>Communication et attitudes </strong>\n
Aptitude à écouter : Satisfaisante (0.5) - L’étudiant a montré une écoute attentive mais sans reformulation des préoccupations du patient. \n
Aptitude à questionner : Très satisfaisante (0.75) - Les questions sont ouvertes, précises et bien ciblées. \n
Aptitude à structurer/mener l’entrevue : Satisfaisante (0.5) - L’entretien est organisé mais présente quelques digressions. \n
Aptitude à fournir les renseignements au patient : Limite (0.25) - Peu d'informations fournies et compréhension non vérifiée. \n
<br />\n
<strong>Performance globale</strong>\n
Performance : Satisfaisante (0.5) - Bonne maîtrise globale, mais quelques oublis essentiels limitent la qualité de la prise en charge. \n`,
        },
        {
          role: "user",
          content: `Note la performance de l'élève :\n${formattedMessages}`,
        },
      ],
      temperature: 0.5,
    });



    const correctedText = assistantResponse.choices[0]?.message?.content || "Erreur lors de la correction.";

    return Response.json({ correction: correctedText });

  } catch (error) {
    console.error("Erreur dans /api/correction :", error);
    return Response.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}
