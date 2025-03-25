'use client'; // Add this if using Next.js App Router

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for token and userID in localStorage
    const token = localStorage.getItem("token");
    const userID = localStorage.getItem("userID");
    setIsLoggedIn(!!token && !!userID);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userID");
    setIsLoggedIn(false);
    // Optionally redirect
    window.location.href = "/";
  };

  return (
    <header className="bg-black text-white py-4 px-6 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo with home button */}
        <Link href="/">
          <button className="flex items-center bg-white p-2 rounded-full">
            <img src="/logo_tsp.png" alt="Logo" className="h-8" />
          </button>
        </Link>

        {/* Navigation */}
        <nav>
          <ul className="flex space-x-6 items-center">
            {isLoggedIn ? (
              <>
                <li>
                  <Link href="/account" className="hover:text-gray-400 font-bold">Compte</Link>
                </li>
                <li>
                  <Link href="/chat" className="hover:text-gray-400 font-bold">Entrainement</Link>
                </li>
                <li>
                  <Link href="/soumettre" className="hover:text-gray-400 font-bold">Soumettre</Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-gray-400 font-bold">Contact</Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded">
                    Déconnexion
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login" className="hover:text-gray-400 font-bold">Profil</Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-gray-400 font-bold">Créer un compte</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
