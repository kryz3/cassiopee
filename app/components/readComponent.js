"use client"
import { useState, useEffect, useRef } from "react";

export default function SpeechInput() {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [mode, setMode] = useState("write"); // "write" or "listen"
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let newText = text; // Keep previous text
        for (let i = event.resultIndex; i < event.results.length; i++) {
          newText += event.results[i][0].transcript + " ";
        }
        setText(newText.trim());
      };

      recognition.onerror = (event) => console.error(event);

      recognitionRef.current = recognition;
    } else {
      alert("Speech Recognition is not supported in your browser.");
    }
  }, []);

  const toggleListening = () => {
    if (!isListening) {
      setText(""); // Reset input
      recognitionRef.current?.start();
    } else {
      recognitionRef.current?.stop();
    }
    setIsListening(!isListening);
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <div className="flex space-x-2">
        <button
          className={`px-4 py-2 rounded ${mode === "write" ? "bg-blue-500 text-white" : "bg-gray-300"}`}
          onClick={() => {
            setMode("write");
            setIsListening(false);
            recognitionRef.current?.stop();
          }}
        >
          ✍️ Write
        </button>
        <button
          className={`px-4 py-2 rounded ${mode === "listen" ? "bg-green-500 text-white" : "bg-gray-300"}`}
          onClick={() => {
            setMode("listen");
            toggleListening();
          }}
        >
          🎙️ Listen
        </button>
      </div>

      <input
        type="text"
        className="border p-2 w-full max-w-md rounded"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={mode === "write" ? "Type here..." : "Speak now..."}
        disabled={mode === "listen"} // Disable typing while listening
      />
    </div>
  );
}
