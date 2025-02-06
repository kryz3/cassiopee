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
    <ul className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-semibold text-black">QA List</h2>
      {QAs.map((qa) => (
        <li key={qa._id} className="p-4 border rounded-lg shadow-sm">
          <Accordion>
            <AccordionItem key={qa._id} aria-label="QA Item" title={qa.question} className="text-black">
              <p className="text-black"><strong>Answer:</strong> {qa.answer}</p>
              <p className="text-gray-600"><strong>Subject:</strong> {qa.Subject}</p>
              <p className="text-gray-600"><strong>Type:</strong> {qa.type}</p>
            </AccordionItem>
          </Accordion>
          <div className="flex justify-between mt-3">
            <button
              onClick={() => handleDelete(qa._id)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
            >
              Delete
            </button>
            <button
              onClick={() => handleVerification(qa._id)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
            >
              {qa.Verified ? "Unverify" : "Verify"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
