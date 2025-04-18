"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { ElevenLabsClient } from "elevenlabs";

export default function ChatComponent() {
  const [sommePoints, setSommePoints] = useState(-1);
  const [corrected, setCorrected] = useState(false);
  const [isAssistantReady, setIsAssistantReady] = useState(false);
  const [isClicked, setIsClick] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [ecosOptions, setEcosOptions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isSubjectLocked, setIsSubjectLocked] = useState(false);
  const [correction, setCorrection] = useState(null);
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [mode, setMode] = useState("write");
  const [instructions, setInstructions] = useState("");
  const [ecosImage, setEcosImage] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const recognitionRef = useRef(null);
  const [userID, setUserID] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const userIDFromLocalStorage = localStorage.getItem("userID");
    setUserID(userIDFromLocalStorage);
  }, []);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "fr";

      recognition.onresult = (event) => {
        let newText = text;
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


  useEffect(() => {
    const fetchEcosTitles = async () => {
      try {
        const res = await fetch(
          "http://157.159.116.203:5001/Ecos/api/getEcosTitles",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          }
        );
        const data = await res.json();
        setEcosOptions(data);
      } catch (error) {
        console.error("Failed to fetch ECOS titles:", error);
      }
    };

    fetchEcosTitles();
  }, []);

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
      const playAudio = () => {
        const audio = new Audio(audioUrl);
        audio
          .play()
          .catch((error) => console.error("Audio play failed:", error));
        document.removeEventListener("click", playAudio);
      };
      document.addEventListener("click", playAudio);
    } catch (error) {
      console.error("Error in text-to-speech:", error);
    }
  };

  const addToHistory = async (points) => {
    try {
      const res = await fetch(
        "http://157.159.116.203:5001/User/api/addEcosToHistory",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: userID,
            ecos: {
              id: selectedSubject,
              note: points,
              duration: timer,
              transcription: messages,
            },
          }),
        }
      );
      if (!res.ok) {
        // Erreur côté serveur, genre 400, 500...
        console.error("Erreur API:", errorData);
        const errorData = await res.json();
   
        return;
      }
      const data = await res.json();

      const res2 = await fetch("http://157.159.116.203:5001/Ecos/api/addNoteToEcos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedSubject, note: points }),
      });
      if (!res2.ok) {
        // Erreur côté serveur, genre 400, 500...
        const errorData2 = await res2.json();
        console.error("Erreur API:", errorData2);
        return;
      }
    
      const data2 = await res2.json();

    } catch (error) {
      console.error("Erreur lors de l'ajout à l'historique de l'ECOS", error);
    }
  };

  const requestCorrection = async () => {
    if (!messages[0]) {
      return null;
    }
    setIsClick(true);
    
    // Arrêter le chronomètre lors de la correction
    if (isTimerRunning) {
      setIsTimerRunning(false);
    }
    
    try {
      const msg = messages.filter((message) => message.role === "user");
      const res = await fetch("/api/correction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msg, sujet: selectedSubject }),
      });

      const data = await res.json();
      if (!data.correction) throw new Error("Erreur récupération correction");
      setIsClick(false), setCorrected(true);
      setCorrection(data.correction);
      const points = parseInt(
        data.correction.split("Total des points :")[1].split("/")[0].trim()
      );
      setSommePoints(points);
      return points
    } catch (error) {
      console.error("Erreur lors de la demande de correction :", error);
    }
  };

  const fetchInstructions = async (id) => {
    try {
      const res = await fetch(
        "http://157.159.116.203:5001/Ecos/api/getEcosStudentInstructions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );
      const data = await res.json();
      setInstructions(data.instructions || "Aucune instruction reçue.");

      // Récupérer l'image associée à l'ECOS
      fetchEcosImage(id);
    } catch (error) {
      console.error("Erreur lors de la récupération des instructions :", error);
    }
  };

  const fetchEcosImage = async (id) => {
    try {
      const res = await fetch("http://157.159.116.203:5001/Ecos/api/getEcosImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.image) {
        setEcosImage(data.image);
      } else {
        setEcosImage(null);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'image :", error);
      setEcosImage(null);
    }
  };

  const sendMessage = async () => {

    if (corrected) {
      return null;
    }
    if (!input.trim()) return;
    if (!isAssistantReady) {
      alert("L'assistant n'est pas encore prêt.");
      return;
    }

    if (!isSubjectLocked) setIsSubjectLocked(true);
    
    // Démarrer le chronomètre au premier message de l'utilisateur
    if (messages.length === 0 && !isTimerRunning) {
      setIsTimerRunning(true);
    }

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
    setIsTyping(true);

    try {
      const assistantId = localStorage.getItem("assistantId");
      const threadId = localStorage.getItem("threadId");

      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          assistantId,
          threadId,
        }),
      });
      const data = await res.json();
      if (!data.response || !data.response[0])
        throw new Error("Invalid response");

      setMessages((prev) => [
        ...prev,
        { role: "chatgpt", content: data.response[0].text.value },
      ]);
      setIsTyping(false);
      setInput("")
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error);
    }
  };

  const toggleListening = () => {
    if (!isListening) {
      setInput("");
      recognitionRef.current?.start();
    } else {
      recognitionRef.current?.stop();
    }
    setIsListening(!isListening);
  };

  // Fonction pour sélectionner un sujet aléatoire
  const selectRandomSubject = async () => {
    if (ecosOptions.length === 0 || isSubjectLocked) return;
    
    // Sélectionner un sujet aléatoire parmi les options disponibles
    const randomIndex = Math.floor(Math.random() * ecosOptions.length);
    const randomSubject = ecosOptions[randomIndex];
    
    setSelectedSubject(randomSubject._id);
    
    if (window.confirm(`Le sujet "${randomSubject.title}" a été sélectionné aléatoirement, continuer?`)) {
      setIsSubjectLocked(true);
      fetchInstructions(randomSubject._id);

      setIsAssistantReady(false);

      const res = await fetch("/api/init-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: randomSubject._id,
          sessionId,
        }),
      });

      if (res.ok) {
        const { assistantId, threadId } = await res.json();
        localStorage.setItem("assistantId", assistantId);
        localStorage.setItem("threadId", threadId);
        setIsAssistantReady(true);
      } else {
        alert("Erreur lors de l'initialisation de l'assistant.");
      }
    } else {
      setSelectedSubject("");
    }
  };

  return (
    <div className="flex w-full h-2/3 justify-center mx-5 ">
      <div className="flex flex-col w-2/3 bg-white p-4 shadow-lg h-full">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Sélectionnez un sujet :
          </label>
          <div className="flex gap-2">
            <select
              className="flex-1 p-2 border rounded-md text-black"
              value={selectedSubject}
              onChange={async (e) => {
                const selectedId = e.target.value;
                setSelectedSubject(selectedId);
                const selectedEco = ecosOptions.find(
                  (eco) => eco._id === selectedId
                );
                if (
                  window.confirm(
                    `Le sujet ${selectedEco.title} est sélectionné, continuer?`
                  )
                ) {
                  setIsSubjectLocked(true);
                  fetchInstructions(selectedId);

                  setIsAssistantReady(false); // Reset in case

                  const res = await fetch("/api/init-assistant", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      subject: selectedId,
                      sessionId,
                    }),
                  });

                  if (res.ok) {
                    const { assistantId, threadId } = await res.json();

                    // Save for reuse
                    localStorage.setItem("assistantId", assistantId);
                    localStorage.setItem("threadId", threadId);

                    setIsAssistantReady(true);
                  } else {
                    alert("Erreur lors de l'initialisation de l'assistant.");
                  }
                }
              }}
              disabled={isSubjectLocked}
            >
              <option value="" disabled>
                Sélectionnez un sujet
              </option>
              {ecosOptions.map((eco) => (
                <option key={eco._id} value={eco._id}>
                  {eco.title}
                </option>
              ))}
            </select>
            <button
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-md shadow transition-colors disabled:opacity-50 disabled:bg-indigo-300"
              onClick={selectRandomSubject}
              disabled={isSubjectLocked}
            >
              Sujet aléatoire
            </button>
          </div>
          {isSubjectLocked && (
            <div className="mt-2 text-sm">
              {!isAssistantReady ? (
                <span className="text-yellow-600 animate-pulse">
                  ⏳ Assistant en cours d'initialisation...
                </span>
              ) : (
                <span className="text-green-600">✅ Assistant prêt !</span>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 p-4 rounded-md bg-gray-100 relative">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-300 text-black rounded-bl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-xs px-4 py-2 rounded-2xl bg-gray-300 text-black text-sm rounded-bl-none">
                <div className="flex space-x-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4">
          <input
            type="text"
            className="flex-1 border p-2 rounded-md text-black"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "write" ? "Écris ici..." : "Parle..."}
            disabled={mode === "listen"}
          />
          <button
            onClick={sendMessage}
            className={`text-white px-4 py-2 rounded-md disabled:opacity-50 ${
              !corrected ? "bg-blue-500" : "bg-red-500"
            }`}
            disabled={!isAssistantReady}
          >
            {!corrected ? "Envoyer" : "Terminé"}
          </button>
        </div>

        {/* Chronomètre placé en bas */}
        {(isTimerRunning || timer > 0) && (
          <div className="flex justify-center mt-2">
            <div className="bg-gray-800 text-white px-3 py-1 rounded-md shadow-md flex items-center space-x-1">
              <span className="font-mono">{formatTime(timer)}</span>
              {isTimerRunning && <span className="text-red-500 animate-pulse">●</span>}
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4 mt-4">
          <button
            className={`px-5 py-2 rounded-full shadow-md text-sm transition ${
              mode === "write"
                ? "bg-blue-500 text-white"
                : "bg-white text-blue-500 border border-blue-500"
            }`}
            onClick={() => {
              setMode("write");
              
              
            }}
          >
            ✍️ Écrire
          </button>
          <button
            className={`px-5 py-2 rounded-full shadow-md text-sm transition ${
              mode === "listen"
                ? "bg-green-500 text-white"
                : "bg-white text-green-500 border border-green-500"
            }`}
            onClick={() => {
              setMode("listen");
              setIsListening(true)
              toggleListening();
            }}
          >
            🎙️ Parler
          </button>
        </div>
      </div>

      <div className="w-1/3 bg-gray-100 border-l flex flex-col max-h-[90vh]">
        <div className="flex-1 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-2 text-black">
            Instructions :
          </h2>
          <div className="text-sm whitespace-pre-wrap text-gray-700 mb-6">
            {instructions || "Aucune instruction sélectionnée."}
          </div>

          {ecosImage && (
            <div className="mb-6">
              {showImage ? (
                <div className="relative">
                  <img
                    src={`/ecos/${ecosImage}`}
                    alt="Image ECOS"
                    className="w-full h-auto rounded-md shadow-md"
                  />
                  <button
                    onClick={() => setShowImage(false)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowImage(true)}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-md shadow-md mb-4"
                >
                  Voir l'image de l'ECOS
                </button>
              )}
            </div>
          )}

          {correction && (
            <div className="mt-6 p-4 bg-gray-200 rounded-md max-h-72 overflow-y-auto">
              <h3 className="font-bold mb-2 text-black ">Correction :</h3>
              {correction.split("\n").map((line, i) => (
                <p
                  key={i}
                  dangerouslySetInnerHTML={{ __html: line }}
                  className="text-sm text-black"
                ></p>
              ))}
            </div>
          )}

          {!corrected && (
            <div className="p-4 border-t">
              <button
                onClick={async () => {
                  const points = await requestCorrection();

                  await addToHistory(points);
                }}
                className={`w-full text-white px-4 py-2 rounded-md shadow-md transition-all 
        ${isClicked ? "bg-gray-500" : "bg-green-500 hover:bg-green-700"}`}
              >
                {isClicked ? "Patienter ..." : "Analyse de l'ECOS"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
