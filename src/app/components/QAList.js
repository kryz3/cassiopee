"use client";

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
          <strong>Id:</strong> {qa._id} <br />
          <strong>Question:</strong> {qa.question} <br />
          <strong>Answer:</strong> {qa.answer} <br />
          <strong>Type:</strong> {qa.type} <br />
          <strong>Subject:</strong> {qa.Subject} <br />
          <strong>Verified:</strong> {qa.Verified ? "Yes" : "No"} <br />
          <button onClick={() => handleDelete(qa._id)}>Delete</button>
          <button onClick={() => handleVerification(qa._id)}>Verify</button>
          <hr />
        </li>
      ))}
    </ul>
  );
}
