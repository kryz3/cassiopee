"use client";
import { useState } from "react";

export default function Account() {
    const [isLogin, setIsLogin] = useState(true);

    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-black">Connexion / Inscription</h1>

                {/* Tabs for Login and Signup */}
                <div className="flex space-x-4 mb-6 justify-center">
                    <button
                        className={`px-4 py-2 font-semibold ${isLogin ? 'text-black border-b-2 border-black' : 'text-gray-600 border-b-2 border-transparent'}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Connexion
                    </button>
                    <button
                        className={`px-4 py-2 font-semibold ${!isLogin ? 'text-black border-b-2 border-black' : 'text-gray-600 border-b-2 border-transparent'}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Inscription
                    </button>
                </div>

                {/* Login Form */}
                {isLogin ? (
                    <form className="space-y-4">
                        <div>
                            <label className="block text-black">Email</label>
                            <input type="email" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black" placeholder="Entrez votre email" />
                        </div>
                        <div>
                            <label className="block text-black">Mot de passe</label>
                            <input type="password" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black" placeholder="Entrez votre mot de passe" />
                        </div>
                        <button type="submit" className="w-full px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-700">Se connecter</button>
                    </form>
                ) : (
                    /* Signup Form */
                    <form className="space-y-4 mt-6">
                        <div>
                            <label className="block text-black">Nom</label>
                            <input type="text" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black" placeholder="Entrez votre nom" />
                        </div>
                        <div>
                            <label className="block text-black">Email</label>
                            <input type="email" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black" placeholder="Entrez votre email" />
                        </div>
                        <div>
                            <label className="block text-black">Mot de passe</label>
                            <input type="password" className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black" placeholder="Entrez votre mot de passe" />
                        </div>
                        <button type="submit" className="w-full px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-700">S'inscrire</button>
                    </form>
                )}
            </div>
        </div>
    );
}
