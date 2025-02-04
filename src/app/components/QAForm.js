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
    <form onSubmit={handleSubmit}>
      <input type="text" name="question" placeholder="Question" value={formData.question} onChange={handleChange} required />
      <input type="text" name="answer" placeholder="Answer" value={formData.answer} onChange={handleChange} required />
      <input type="text" name="type" placeholder="Type" value={formData.type} onChange={handleChange} required />
      <input type="text" name="Subject" placeholder="Subject" value={formData.Subject} onChange={handleChange} required />
      <label>
        Verified:
        <input type="checkbox" name="Verified" checked={formData.Verified} onChange={handleChange} />
      </label>
      <button type="submit">Add QA</button>
    </form>
  );
}
