"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ email: "", role: "" });

  useEffect(() => {
    async function fetchUserData() {
      const userID = localStorage.getItem("userID"); // Get user ID from localStorage

      if (!userID) {
        router.push("/"); // Redirect if user ID is missing (not authenticated)
        return;
      }

      try {
        const response = await fetch("http://localhost:5001/User/api/getUser", {
          method: "POST", // Use POST if sending a body, or use query params in GET
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Send cookies with request
          body: JSON.stringify({ id: userID }), // Correctly format body
        });

        if (!response.ok) throw new Error("Unauthorized");

        const data = await response.json();
        setUser({ email: data.email, role: data.role });
      } catch (error) {
        console.error("Authentication failed:", error);
        router.push("/"); // Redirect if not authenticated
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold">Profile Page</h2>
      <p className="mt-4">Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <button
        onClick={() => {
          document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          localStorage.clear();
          router.push("/");
        }}
        className="mt-4 bg-red-500 text-white p-2 rounded-md"
      >
        Logout
      </button>
    </div>
  );
}
