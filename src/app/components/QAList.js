"use client";
import { Accordion, AccordionItem } from "@heroui/accordion";

export default function QAList({ QAs, setQAs }) {
  const handleDelete = async (id) => {
    try {
      const response = await fetch("http://localhost:5001/QA/api/deleteQA", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete QA");
      }

      setQAs((prevQAs) => prevQAs.filter((qa) => qa._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleVerification = async (id) => {
    try {
      const response = await fetch("http://localhost:5001/QA/api/verifyQA", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify QA");
      }

      setQAs((prevQAs) =>
        prevQAs.map((qa) =>
          qa._id === id ? { ...qa, Verified: !qa.Verified } : qa
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ul>
      {QAs.map((qa) => (
        <li key={qa._id}>
          <Accordion>
            <AccordionItem key="1" aria-label="Accordion 1" title={qa._id}>
              {qa.question} <br /> <br/>
              {qa.answer} <br /> <br/>
              {qa.Subject} <br />
              {qa.type}
            </AccordionItem>
          </Accordion>
          <button onClick={() => handleDelete(qa._id)}>Delete</button>
          <button onClick={() => handleVerification(qa._id)}>Verify</button>
          <hr />
        </li>
      ))}
    </ul>
  );
}
