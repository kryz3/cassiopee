import { useState } from "react";

export default function GenerateQA() {
    const [loading, setLoading] = useState(false);
    const [isGenerated, setIsGenerated] = useState(false);
    const [generatedQuestion, setGeneratedQuestion] = useState("");

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

            if (!response.ok) { // Vérifier si la requête a réussi
                throw new Error("Failed to generate QA");
            }

            const data = await response.text();
            setGeneratedQuestion(data);
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
                <div>
                    <h3>Nouvelle Question :</h3>
                    <p>{generatedQuestion}</p>
                </div>
            )}
        </div>
    );
}
