"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function Profile() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName ] = useState("");
    const [user, setUser] = useState({
        username: "Caca Prout",
        email: "cacaprout@example.com",
        avatar: "http://localhost:3000/userdb/avatar/default.png", 
        testsTaken: 0,
        grades: [], // Exemple de notes
        id: "",
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
            console.log(data)
    
            setUser({ username: data.user.username, email: data.user.email, avatar:data.user.avatar, testsTaken: 0, grades: [], id: data.user._id });
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

    const handleSave = async () => {
        if (newName != user.username && (newName)) {
            async function changeUsername(user, newName) {
                try {
                  const response2 = await fetch("http://localhost:5001/User/api/changeUsername", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: user.id, username: newName }),
                  });
              
                  if (!response2.ok) {
                    throw new Error(`Server error: ${response2.status}`);
                  }
              

                  

                } catch (error) {
                  console.error("Failed to change username", error);
                }
              }
            changeUsername(user, newName)      
            setUser((prevUser) => ({ ...prevUser, username: newName }));        
        }
        setIsEditing(false);
        // Ici, vous enverriez normalement les données mises à jour de l'utilisateur à votre backend
    };

    const handleChange = (e) => {
        setNewName(e.target.value)
        console.log(newName)

    };

    const calculateAverage = (grades) => {
        const total = grades.reduce((sum, grade) => sum + grade, 0);
        return grades.length ? (total / grades.length).toFixed(2) : 0;
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md ">
                <h1 className="text-2xl font-bold mb-4 text-center text-black">Profil Utilisateur</h1>
                <div className="flex justify-center mb-4">
                    <img
                        src={user.avatar}
                        alt="Profile"
                        className="rounded-full w-24 h-24 object-cover"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-black font-bold">Nom</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="name"
                            onChange={handleChange}
                            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                        />
                    ) : (
                        <p className="mt-2 text-black">{user.username}</p>
                    )}
                </div>
                <div className="mb-4">
                    <label className="block text-black font-bold">Email</label>
                
                        <p className="mt-2 text-black">{user.email}</p>

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