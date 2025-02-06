"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null); // Clear previous errors

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const response = await fetch("http://localhost:5001/User/api/loginUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });

      const data = await response.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("userID", data.id);

      if (!response.ok) {
        throw new Error(response.message);
        return;
      }

      // Redirect to profile page on success
      router.push("/profile");
    } catch (error) {
      console.log(error.message);
      setError(error.message);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold text-red-700">Login</h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 mt-4 ">
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
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
          Login
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
