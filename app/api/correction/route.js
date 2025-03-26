import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { messages, sujet } = await req.json();
    console.log(messages, sujet, "messages, sujet")

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
    const gridRes = await fetch("http://localhost:5001/Ecos/api/getEcosGrid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: sujet }),
    });


    if (!gridRes.ok) {
      return Response.json({ error: "Erreur lors de la récupération de la grille." }, { status: 500 });
    }

    const gridData = await gridRes.json();
    const ecosGrid = gridData?.instructions;

    
    console.log("ligne 42")
    console.log(gridData)
    console.log("ok ici ça marche ligne 42")
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
          content: `Tu es médecin et tu dois faire un feedback de l'entretien en suivant les consignes suivantes :\n${grilleEvaluationString} Renvoie strictement ceci en remplacement "nombre de points par le nombre de points gagnés. Ensuite, effectue la notation de "Communication et attitudes" puis de "Performance globale" en fonction de cela: Communications et attitudes Performance	Insuffisante
0	Limite
0.25	Satisfaisante
0.5	Très satisfaisante
0.75	Remarquable
1
APTITUDE À ÉCOUTER 	Interrompt le patient /pair de façon inappropriée. Ignore les réponses du patient/collègue 	Se montre impatient 	Est attentif aux réponses du patient/pair 	Adopte la technique de reformulation si l’information est imprécise ou éloignée des objectifs. 	Porte une attention soutenue aux réponses du patient/pair et à ses préoccupations 
APTITUDE À QUESTIONNER 	Pose des questions fermées ou tendancieuses. Utilise le jargon médical 	Pose des questions qui s'éloignent des objectifs. Utilise quelques fois un jargon médical sans explication 	Utilise de différents types de questions couvrant les éléments essentiels. Utilise quelques fois un jargon médical mais toujours avec explications 	Pose des questions précises couvrant la plupart des éléments avec quelques omissions mineures. Utilise le langage approprié. 	Pose les questions avec assurance et savoir-faire 
APTITUDE À STRUCTURER/ MENER L’ENTREVUE	Approche désordonnée	Entrevue peu structurée, présente les difficultés à recadrer les discussions qui s'éloignent des objectifs	Entrevue centrée sur le problème et couvre les éléments essentiels	Entrevue menée de façon logique, structurée, centrée sur le problème, ne cherche pas l’information non pertinente	Entrevue ayant un but précis, approche intégrée
APTITUDE À FOURNIR LES RENSEIGNEMENTS AU PATIENT	Renseigne le parent de manière inadaptée (ex. informations inexactes) ou ne fait aucun effort pour renseigner le parent 	Donne des renseignements de façon incomplète ou s’attarde à des renseignements éloignés du problème 	Donne des renseignements de façon adaptée. Veille quelque peu à ce que le parent comprenne 	Donne des renseignements de façon adaptée. Veille à ce que le parent comprenne 	Renseigne avec justesse et illustre ses explications pour qu'elles soient bien comprises 
*EVALUATION  DE LA PERFORMANCE GLOBALE
Performance Insuffisante
0	Performance limite
0.25	Performance satisfaisante
0.5	Performance très satisfaisante
0.75	Performance remarquable
1
Très au-dessous des attentes
Les attentes sont non observables ou non respectées.
Présente un niveau inacceptable de performance.	
Ni qualifié ni non qualifié
Les omissions et les inexactitudes dans la réalisation des tâches.
Démontre du potentiel pour atteindre la compétence.	Conforme aux attentes
Démontre les éléments essentiels de la performance.
Prêt pour avancer en toute sécurité.	Au-delà des attentes
Quelques omissions/erreurs mineures et non essentielles.
Démontre la plupart des  aspects de la compétence .	Très au-delà des attentes
Agit sans hésitation et sans erreur.
Démontre la maîtrise de tous les aspects de la compétence.

VOICI UN EXEMPLE DE MISE EN PAGE À RESPECTER: Bonjour, voici l'évaluation de la performance de l'élève selon les critères fournis :
1. **Salue la patiente et se présente par sa fonction** : Non réalisé correctement (0 pts)
2. **Antécédent similaire de céphalées** : Oui (1 pt)
3. **Antécédent de traumatisme crânien** : Non mentionné (0 pts)
4. **Recherche une phono-photophobie** : Non mentionné (0 pts)
5. **Recherche la présence de nausée-vomissement** : Non mentionné (0 pts)
6. **Recherche la notion de fièvre** : Non mentionné (0 pts)
7. **Recherche un trouble neurologique focal associé** : Non mentionné (0 pts)
8. **Recherche le caractère pulsatile** : Oui (1 pt)
9. **Recherche le caractère unilatéral** : Oui (1 pt)
10. **Recherche l’aggravation à l’effort de la douleur** : Non mentionné (0 pts)
11. **Recherche le caractère invalidant** : Non mentionné (0 pts)
12. **Recherche la périodicité des crises** : Non mentionné (0 pts)
13. **Recherche la présence d’aura migraineuse** : Non mentionné (0 pts)
14. **Migraine** : Non mentionné (0 pts)
15. **Pas d’imagerie** : Non mentionné (0 pts)
**Total des points : 3/15**
### Communication et attitudes
- **Aptitude à écouter** : Limite (0.25) - L'élève s'est présenté et a posé des questions, mais la présentation était inappropriée et il n'a pas démontré une écoute active des préoccupations potentielles du patient.
- **Aptitude à questionner** : Limite (0.25) - Pose des questions directement liées à la condition mais ne couvre pas tous les aspects nécessaires pour un diagnostic complet.
- **Aptitude à structurer/mener l’entrevue** : Limite (0.25) - L'entrevue est quelque peu structurée mais manque de couverture complète des éléments essentiels.
- **Aptitude à fournir les renseignements au patient** : Insuffisante (0) - Aucune information n'a été fournie au patient sur la condition, le diagnostic ou les étapes suivantes.
### Performance globale
- **Performance** : Limite (0.25) - L'élève a montré une compréhension partielle des aspects nécessaires pour évaluer un patient avec des céphalées, mais il y a eu des omissions significatives qui pourraient affecter le diagnostic et le traitement du patient.
L'élève doit améliorer la couverture des aspects cliniques essentiels et la communication avec le patient pour assurer une évaluation complète et précise.
`,
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
