"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { ElevenLabsClient } from "elevenlabs";

export default function ChatComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Asthme");
  const [sessionId, setSessionId] = useState(null);
  const [isSubjectLocked, setIsSubjectLocked] = useState(false);
  const [correction, setCorrection] = useState(null);
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [mode, setMode] = useState("write"); // "write" or "listen"
  const recognitionRef = useRef(null);

  const instructions = { 
    Migraine: `Vous êtes interne aux urgences et vous recevez Mr/Mme A âgé(e) de 34 ans, il/elle consulte devant des céphalées évoluant depuis deux jours qui ne cèdent pas à la prise de doliprane.
Constantes : PA : 121/68 mmhg, FC 74 bpm, SpO2 99%, FR 12/min, Dextro : 5.3 mmo/l, T 36°, Glasgow 15.

Vous devez :
 Mener un interrogatoire ciblé et bien préciser l’anamnèse des céphalées
 Donner un diagnostic

Vous ne devez pas :
 Réaliser un examen clinique 
 Proposer une prise en charge thérapeutique
`
  }

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "fr";

      recognition.onresult = (event) => {
        let newText = text; // Keep previous text
        for (let i = event.resultIndex; i < event.results.length; i++) {
          newText += event.results[i][0].transcript + " ";
        }
        setInput(newText.trim());
      };

      recognition.onerror = (event) => console.error(event);

      recognitionRef.current = recognition;
    } else {
      alert("Speech Recognition is not supported in your browser.");
    }
  }, []);

  const toggleListening = () => {
    if (!isListening) {
      setInput(""); // Reset input
      recognitionRef.current?.start();
    } else {
      recognitionRef.current?.stop();
    }
    setIsListening(!isListening);
  };

  useEffect(() => {
    let storedSessionId = localStorage.getItem("chatSessionId");
    if (!storedSessionId) {
      storedSessionId = uuidv4();
      localStorage.setItem("chatSessionId", storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role !== "user") {
      playTextToSpeech(lastMessage.content);
    }
  }, [messages]);

  const playTextToSpeech = async (text) => {
    const client = new ElevenLabsClient({
      apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
    });

    try {
      const audioStream = await client.textToSpeech.convertAsStream(
        "nPczCjzI2devNBz1zQrb",
        {
          output_format: "mp3_44100_128",
          text: text,
          model_id: "eleven_flash_v2_5",
        }
      );
      const audioChunks = [];
      for await (const chunk of audioStream) {
        audioChunks.push(chunk);
      }

      const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Ensure user interaction before playing
      const playAudio = () => {
        const audio = new Audio(audioUrl);
        audio.play().catch((error) => {
          console.error("Audio play failed:", error);
        });
        document.removeEventListener("click", playAudio);
      };

      document.addEventListener("click", playAudio);
    } catch (error) {
      console.error("Error in text-to-speech:", error);
    }
  };
  const requestCorrection = async () => {
    try {
      const msg = (messages.filter(message => message.role === 'user'))
      const res = await fetch("/api/correction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msg, sujet: selectedSubject }),
      });

      const data = await res.json();
      console.log("Correction reçue :", data);

      if (!data.correction) {
        throw new Error("Erreur lors de la récupération de la correction");
      }

      setCorrection(data.correction); // Stocke la correction reçue
    } catch (error) {
      console.error("Erreur lors de la demande de correction :", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (!isSubjectLocked) {
      setIsSubjectLocked(true);
    }

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: input },
    ]);
    setInput("");

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          subject: selectedSubject,
          sessionId,
        }),
      });

      const data = await res.json();
      if (!data.response || !data.response[0]) {
        throw new Error("Invalid response format");
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "chatgpt", content: data.response[0].text.value },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-4 h-screen">
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">
          Sélectionnez un sujet :
        </label>
        <select
          className="w-full p-2 border rounded-md text-black"
          value={selectedSubject}
          onChange={(e) => {
            setSelectedSubject(e.target.value);
            if (window.confirm("Le sujet " + e.target.value + " est sélectionné, afficher les instructions?")) {
              alert(instructions[e.target.value])
            }
          }}
          
          disabled={isSubjectLocked}
        >
          <option value="Asthme">Asthme</option>
          <option value="Diabete">Diabete</option>
          <option value="Migraine">Migraine</option>
        </select>
      </div>

      <div className="h-96 overflow-y-auto p-2 border-b">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 my-1 ${
              msg.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block p-2 rounded-md ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center p-2">
        <div className="flex flex-col items-center space-y-4 p-4">
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 rounded ${
                mode === "write" ? "bg-blue-500 text-white" : "bg-gray-300"
              }`}
              onClick={() => {
                setMode("write");
                setIsListening(false);
                recognitionRef.current?.stop();
              }}
            >
              ✍️ Écrire
            </button>
            <button
              className={`px-4 py-2 rounded ${
                mode === "listen" ? "bg-green-500 text-white" : "bg-gray-300"
              }`}
              onClick={() => {
                setMode("listen");
                toggleListening();
              }}
            >
              🎙️ Parler
            </button>
          </div>

          <input
            type="text"
            className="border p-2 w-full max-w-md rounded"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "write" ? "Type here..." : "Speak now..."}
            disabled={mode === "listen"} // Disable typing while listening
          />
        </div>
        <button
          onClick={sendMessage}
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Envoyer
        </button>
      </div>
      {/* Bouton Corriger */}
      <div className="mt-4">
        <button
          onClick={requestCorrection}
          className="w-full bg-green-500 text-white px-4 py-2 rounded-md"
        >
          Analyse de l'ECOS
        </button>
      </div>

      {/* Affichage de la correction */}
      {correction && (
        <div className="mt-4 p-2 bg-gray-100 border rounded-md">
          <h3 className="font-bold text-gray-700">Correction :</h3>
          <p className="text-black">
            {correction.split("\n").map((paragraph, index) => (
              <span key={index}>
                {paragraph}
                <br />
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}
