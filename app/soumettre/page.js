"use client";
import { useState } from "react";

export default function AddTopic() {
    const [title, setTitle] = useState("");
    const [studentInstructions, setStudentInstructions] = useState("");
    const [evaluationGrid, setEvaluationGrid] = useState([{ consigne: "", points: "" }]);
    const [patientInstructions, setPatientInstructions] = useState("");
    const [image, setImage] = useState(null);
    const [message, setMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would normally send the data to your backend
        setMessage("Sujet ajouté avec succès!");
        setTitle("");
        setStudentInstructions("");
        setEvaluationGrid([{ consigne: "", points: "" }]);
        setPatientInstructions("");
        setImage(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
        }
    };

    const handleEvaluationGridChange = (index, field, value) => {
        const newGrid = [...evaluationGrid];
        newGrid[index][field] = value;
        setEvaluationGrid(newGrid);
    };

    const addEvaluationRow = () => {
        setEvaluationGrid([...evaluationGrid, { consigne: "", points: "" }]);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-black">Ajouter un Nouveau Sujet</h1>
                {message && <p className="text-center text-green-600">{message}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-black">Titre</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                            placeholder="Titre du sujet"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-black">Consignes pour les étudiants</label>
                        <textarea
                            value={studentInstructions}
                            onChange={(e) => setStudentInstructions(e.target.value)}
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                            placeholder="Consignes pour les étudiants"
                            rows="4"
                            required
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="block text-black">Grille d'évaluation</label>
                        {evaluationGrid.map((row, index) => (
                            <div key={index} className="flex space-x-2 mb-2">
                                <input
                                    type="text"
                                    value={row.consigne}
                                    onChange={(e) => handleEvaluationGridChange(index, "consigne", e.target.value)}
                                    className="flex-1 px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                                    placeholder="Consigne"
                                    required
                                />
                                <input
                                    type="number"
                                    value={row.points}
                                    onChange={(e) => handleEvaluationGridChange(index, "points", e.target.value)}
                                    className="w-20 px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                                    placeholder="Points"
                                    required
                                />
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addEvaluationRow}
                            className="text-gray-600 underline"
                        >
                            Ajouter une ligne
                        </button>
                    </div>
                    <div className="mb-4">
                        <label className="block text-black">Consignes pour le patient</label>
                        <textarea
                            value={patientInstructions}
                            onChange={(e) => setPatientInstructions(e.target.value)}
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                            placeholder="Consignes pour le patient"
                            rows="4"
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="block text-black">Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                        />
                    </div>
                    <button type="submit" className="w-full px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-700">Ajouter</button>
                </form>
            </div>
        </div>
    );
}
