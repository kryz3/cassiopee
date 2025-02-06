"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [userID, setUserID] = useState(null);
  const router = useRouter();
  useEffect(() => {
    const storedUserID = localStorage.getItem("userID");
    if (storedUserID) {
      setUserID(storedUserID);
    }
  }, []);

  const [role, setRole] = useState("user");

  let shown;

  if (!userID) {
    const handleLoginClick = () => {
      router.push("/login");
    };

    const handleRegisterClick = () => {
      router.push("/register");
    };

    shown = (
      <ul className="space-x-5">
        <button onClick={handleLoginClick}>Se connecter</button>
        <button onClick={handleRegisterClick}>S'inscrire</button>
        <a href="/about">À propos</a>
      </ul>
    );
  } else {
    const caca = async () => {
      try {
        const response = await fetch("http://localhost:5001/User/api/getUser", {
          method: "POST", // Use POST if sending a body, or use query params in GET
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id: userID }), // Correctly format body
        });
        const data = await response.json();

        setRole(data.user.role);
        if (!response.ok) throw new Error("No userid in storage ");
      } catch (error) {
        console.error("Authentication failed:", error);
        router.push("/"); // Redirect if not authenticated
      }
    };
    caca();

    shown = (
      <ul className="space-x-5">
        <a href="/profile">Profil</a>
        {role === "admin" ? (
          <a href="/admin ">Admin</a>
        ) : (
          <a href="/stats">Stats</a>
        )}
        <a href="/chatbox">Chatbot</a>
        <a href="/about">À propos</a>
        <button
          onClick={() => {
            document.cookie =
              "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            localStorage.clear();
            router.push("/");
            window.location.reload()
          }}
        >
          Logout
        </button>
      </ul>
    );
  }

  return (
    <>
      <header className="flex justify-between flex-row mx-20 my-10 items-center">
        <a href="/">ECOS</a>
        {shown}
      </header>
    </>
  );
}
