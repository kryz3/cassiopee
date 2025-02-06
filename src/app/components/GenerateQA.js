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
    };
    try {
      const response = await fetch("http://localhost:5001/QA/api/addQA", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response) {
        throw new Error("Failed to add QA");
      }
      location.reload();
    } catch (error) {
      console.error(error.message);
    }
  };

  const generateContent = async () => {
    setLoading(true);
    setIsGenerated(false);

    try {
      const response = await fetch("/api/generateQA", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate QA");
      }

      const data = await response.text();
      const [sujet, type, question, reponse] = data.split("#");
      setGeneratedQuestion([sujet, type, question, reponse]);
      setIsGenerated(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md text-center">
      <button
        onClick={generateContent}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all disabled:bg-gray-400"
      >
        {loading ? "Génération en cours..." : "Générer une question"}
      </button>

      {isGenerated && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-100">
          <h3 className="text-lg font-semibold">Nouvelle Question :</h3>
          <ul className="mt-2 space-y-2 text-gray-700">
            {generatedQuestion.map((gen, index) => (
              <li key={index} className="p-2 border rounded-lg">{gen}</li>
            ))}
          </ul>
          <button
            onClick={addToDb}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
          >
            Add to database
          </button>
        </div>
      )}
    </div>
  );
}
