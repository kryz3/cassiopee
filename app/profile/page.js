"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function Profile() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState({
        name: "Caca Prout",
        email: "cacaprout@example.com",
        avatar: "", // Commence avec une photo vide
        testsTaken: 5,
        grades: [85, 90, 78, 92, 88] // Exemple de notes
    });

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
            if (!response.ok) throw new Error("No userid in storage ");
    
            setUser({ name: data.user.username, email: data.user.email, role: data.user.role, avatar:data.user.avatar, testsTaken: 5, grades: [85, 90, 78, 92, 88] });
          } catch (error) {
            console.error("Authentication failed:", error);
            router.push("/"); // Redirect if not authenticated
          } 
        }
    
        fetchUserData();
      }, [router]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        setIsEditing(false);
        // Ici, vous enverriez normalement les données mises à jour de l'utilisateur à votre backend
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({
            ...prevUser,
            [name]: value
        }));
    };

    const calculateAverage = (grades) => {
        const total = grades.reduce((sum, grade) => sum + grade, 0);
        return grades.length ? (total / grades.length).toFixed(2) : 0;
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-center text-black">Profil Utilisateur</h1>
                <div className="flex justify-center mb-4">
                    <img
                        src="https://via.placeholder.com/150?text=No+Photo"
                        alt="Profile"
                        className="rounded-full w-24 h-24 object-cover"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-black">Nom</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="name"
                            value={user.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                        />
                    ) : (
                        <p className="mt-2 text-black">{user.name}</p>
                    )}
                </div>
                <div className="mb-4">
                    <label className="block text-black">Email</label>
                    {isEditing ? (
                        <input
                            type="email"
                            name="email"
                            value={user.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                        />
                    ) : (
                        <p className="mt-2 text-black">{user.email}</p>
                    )}
                </div>
                {isEditing ? (
                    <button
                        onClick={handleSave}
                        className="w-full px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-700"
                    >
                        Sauvegarder
                    </button>
                ) : (
                    <button
                        onClick={handleEdit}
                        className="w-full px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-700"
                    >
                        Modifier
                    </button>
                )}

                {/* Section Statistiques */}
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2 text-black">Statistiques</h2>
                    <p className="text-black">Nombre de tests effectués: {user.testsTaken}</p>
                    <p className="text-black">Moyenne des notes: {calculateAverage(user.grades)}</p>
                    <div className="mt-2">
                        <h3 className="text-lg font-semibold mb-1 text-black">Détail des notes:</h3>
                        <ul className="list-disc list-inside text-black">
                            {user.grades.map((grade, index) => (
                                <li key={index}>Test {index + 1}: {grade}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}