"use client";
import { useState } from "react";

export default function AddTopic() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would normally send the data to your backend
        setMessage("Sujet ajouté avec succès!");
        setTitle("");
        setDescription("");
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
                        <label className="block text-black">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                            placeholder="Description du sujet"
                            rows="4"
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="w-full px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-700">Ajouter</button>
                </form>
            </div>
        </div>
    );
}