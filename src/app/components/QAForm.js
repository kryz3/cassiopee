"use client";

import { useState } from "react";

export default function QAForm({ setQAs }) {
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    type: "",
    Subject: "",
    Verified: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5001/QA/api/addQA", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Failed to add QA");
      }
      const newQA = await response.json();
      setQAs((prev) => [...prev, newQA]); 
      setFormData({
        question: "",
        answer: "",
        type: "",
        Subject: "",
        Verified: false,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold text-gray-700">Add a New QA</h2>
      <input
        type="text"
        name="question"
        placeholder="Question"
        value={formData.question}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        name="answer"
        placeholder="Answer"
        value={formData.answer}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        name="type"
        placeholder="Type"
        value={formData.type}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        name="Subject"
        placeholder="Subject"
        value={formData.Subject}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="Verified"
          checked={formData.Verified}
          onChange={handleChange}
          className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
        />
        <label className="text-gray-600">Verified</label>
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-all"
      >
        Add QA
      </button>
    </form>
  );
}