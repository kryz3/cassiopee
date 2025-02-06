"use client";

import { useEffect, useState } from "react";
import QAForm from "../components/QAForm";
import QAList from "../components/QAList";
import GenerateQA from "../components/GenerateQA";

export default function Home() {
  const [QAs, setQAs] = useState([]);
  const [error, setError] = useState(null);

  const fetchQAs = async () => {
    try {
      const response = await fetch("http://localhost:5001/QA/api/getQAs");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setQAs(data);
    } catch (error) {
      console.error("Error fetching QAs:", error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchQAs();
  }, []);

  return (
    <>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <QAForm setQAs={setQAs} />
      <QAList QAs={QAs} setQAs={setQAs} />
      <GenerateQA/>
    </>
  );
}
