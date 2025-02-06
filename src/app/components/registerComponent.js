"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null); // Clear previous errors

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    const username = formData.get("username")

    try {
      const response = await fetch("http://localhost:5001/User/api/addUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
        credentials: "include"
      })

      const data = await response.json();

      if (!response.ok) {

        setError(data.error)
        throw new Error(data.error);
        return;}
      setSuccess("Compte bien créé")
      return
    } catch (error) {
      setError(error.message);
    }
  }
  return (
    <div className="">
    <div className="flex-col items-center justify-center m-0">
      <h2 className="text-2xl font-bold text-red-700">Register</h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 mt-4 ">
      <input
          type="text"
          name="username"
          placeholder="Nom d'utilisateur"
          required
          className="p-2 border border-gray-300 rounded-md"
        />
        <input
          type="text"
          name="email"
          placeholder="Email"
          required
          className="p-2 border border-gray-300 rounded-md"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="p-2 border border-gray-300 rounded-md"
        />
       <div className="flex justify-center">
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
          Register
        </button>
        <button onClick={() => router.push("/login")} className="bg-red-500 text-white p-2 rounded-md">
          Login
        </button>
        </div>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success  && <p className="text-green-500 mt-2">{success}</p>}
    </div>
    </div>
  );
}
