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
    
      

      try {
        const response = await fetch("http://localhost:5001/User/api/getUser", {
          method: "POST", // Use POST if sending a body, or use query params in GET
          headers: { "Content-Type": "application/json" },
          
          body: JSON.stringify({ id: userID }), // Correctly format body
        });
        const data = await response.json();
        console.log("ok")
        if (!response.ok) throw new Error("No userid in storage ");

        setUser({ email: data.user.email, role: data.user.role });
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

    </div>
  );
}
