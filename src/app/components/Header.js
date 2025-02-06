"use client";
import { useState, useEffect } from "react";
import LoginPage from "./loginComponent";
import RegisterPage from "./registerComponent";

export default function Header() {
  const userID = localStorage.getItem("userID"); // Get user ID from localStorage
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [isRegisterVisible, setIsRegisterVisible] = useState(false);

  const handleLoginClick = () => {
    setIsLoginVisible(!isLoginVisible);
    if (!isLoginVisible && isRegisterVisible) { setIsRegisterVisible(false)}
  };

  const handleRegisterClick = () => {
    setIsRegisterVisible(!isRegisterVisible);
    if (isLoginVisible && !isRegisterVisible) { setIsLoginVisible(false)}
  };


  let shown;

  if (!userID) {
    shown = (
      <ul className="space-x-5">
        <button onClick={handleLoginClick}>Se connecter</button>
        <button onClick={handleRegisterClick}>S'inscrire</button>
        <a href="/about">À propos</a>
      </ul>
    );
  } else {
    console.log(!!userID, "???");
    shown = (
      <ul>
        <a href="/profile">Profil</a>
        <a href="/stats">Stats</a>
        <a href="/chatbox">Chatbot</a>
        <a href="/about">À propos</a>
      </ul>
    );
  }

  return (
    <>
      <header className="flex justify-between flex-row mx-20 my-10 items-center">
        <a href="/">ECOS</a>
        {shown}
      </header>
      {isLoginVisible && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <LoginPage />
        </div>
      )}
      {isRegisterVisible && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <RegisterPage />
        </div>
      )}
    </>
  );
}
