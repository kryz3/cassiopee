import { useState } from "react";

export default function GenerateQA() {
  const [loading, setLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] = useState({});

  const addToDb = async () => {
    const body = {
        question: generatedQuestion[2],
        answer: generatedQuestion[3],
        type: generatedQuestion[1],
        Subject: generatedQuestion[0],
        verified: false,
    }
    try {
        const response = await fetch("http://localhost:5001/QA/api/addQA", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          if (!response) {
            throw new Error("Failed to add QA")
          }
          location.reload();

    } catch (error) { console.error(error.message)}
  }

  const generateContent = async () => {
    setLoading(true); // Ici, on utilise un booléen
    setIsGenerated(false);

    try {
      const response = await fetch("/api/generateQA", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Vérifier si la requête a réussi
        throw new Error("Failed to generate QA");
      }

      const data = await response.text();
      const [sujet, type, question, reponse] = data.split("#");
      setGeneratedQuestion([ sujet, type, question, reponse ]);
      setIsGenerated(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Toujours un booléen
    }
  };

  return (
    <div>
      <button onClick={generateContent} disabled={loading}>
        {loading ? "Génération en cours..." : "Générer une question"}
      </button>

      {isGenerated && (
        <>
          <div>
            <h3>Nouvelle Question :</h3>
            <ul>
              {generatedQuestion.map((gen, index) => (
                <li key={index} >{gen}</li>
              ))}
            </ul>
          </div>
          <button onClick={addToDb}>Add to database</button>
        </>
      )}
    </div>
  );
}
