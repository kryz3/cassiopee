"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showTranscriptionIndex, setShowTranscriptionIndex] = useState(null);

  const handleShowTranscription = (index) => {
    setShowTranscriptionIndex(showTranscriptionIndex === index ? null : index); // Toggle the popup
  };

  const [newName, setNewName] = useState("");
  const [user, setUser] = useState({
    username: "",
    email: "",
    avatar: "http://localhost:3000/userdb/avatar/default.png",
    id: "",
    testsHistory: [],
  });

  // State for Ecos data
  const [ecosData, setEcosData] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // For searching by title
  const [sortBy, setSortBy] = useState("date"); // Default sort by date
  const [selectedTheme, setSelectedTheme] = useState(""); // For filtering by situation de départ
  const [startDate, setStartDate] = useState(""); // For date range filtering
  const [endDate, setEndDate] = useState(""); // For date range filtering
  const [availableThemes, setAvailableThemes] = useState([]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedTheme("");
    setStartDate("");
    setEndDate("");
    setSortBy("date");
  };

  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      const userID = localStorage.getItem("userID"); // Get user ID from localStorage

      if (!userID) {
        router.push("/"); // Redirect if no userID
        return;
      }

      try {
        const response = await fetch("http://localhost:5001/User/api/getUser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userID }),
        });
        
        if (!response.ok) throw new Error("Failed to fetch user data");
        
        const data = await response.json();
        console.log(data);

        setUser({
          username: data.user.username,
          email: data.user.email,
          avatar: data.user.avatar,
          id: data.user._id,
          testsHistory: data.user.testsHistory || [],
        });
        
        // Initialize newName with current username
        setNewName(data.user.username);

        // Fetch Ecos data based on testsHistory
        if (data.user.testsHistory && data.user.testsHistory.length > 0) {
          fetchEcosData(data.user.testsHistory);
        }
      } catch (error) {
        console.error("Authentication failed:", error);
        router.push("/"); // Redirect if not authenticated
      }
    }

    fetchUserData();
  }, [router]);

  // Fetch Ecos data based on the test history
  const fetchEcosData = async (testsHistory) => {
    // Create a map to deduplicate Ecos subjects
    const uniqueEcosSubjects = new Map();
    const ecosDataArray = [];
    const themesSet = new Set(); // To collect unique situations de départ
    
    // First, collect unique subject IDs
    const uniqueSubjectIds = [...new Set(testsHistory.map(test => test.idSujet?.toString()))].filter(Boolean);
    
    // Fetch data for each unique subject ID
    for (const subjectId of uniqueSubjectIds) {
      try {
        const response = await fetch("http://localhost:5001/Ecos/api/getEcos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: subjectId }),
        });

        if (!response.ok) {
          console.error(`Failed to fetch Ecos with ID ${subjectId}`);
          continue;
        }

        const data = await response.json();
        uniqueEcosSubjects.set(subjectId, {
          title: data.title,
          theme: data.theme
        });
        
        // Add theme to our set of available situations de départ
        if (data.theme) {
          themesSet.add(data.theme);
        }
      } catch (error) {
        console.error(`Error fetching Ecos data for ID ${subjectId}:`, error);
      }
    }
    
    // Now create entries for each test, but with the subject data attached
    for (const test of testsHistory) {
      if (!test.idSujet) continue;
      
      const subjectId = test.idSujet.toString();
      const subjectData = uniqueEcosSubjects.get(subjectId);
      
      if (!subjectData) continue; // Skip if we couldn't get the subject data
      
      ecosDataArray.push({
        id: test.idSujet,
        testId: test._id || `test-${subjectId}-${new Date(test.date).getTime()}`, // Add a unique ID for each test
        title: subjectData.title,
        theme: subjectData.theme,
        date: test.date,
        note: test.note,
        duration: test.duration, // Ajout de la durée
      });
    }

    // Update state with fetched Ecos data and available situations de départ
    setEcosData(ecosDataArray);
    setAvailableThemes(Array.from(themesSet).sort());
  };

  // Handle username edit functionality
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (newName && newName !== user.username) {
      try {
        const response = await fetch(
          "http://localhost:5001/User/api/changeUsername",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: user.id, username: newName }),
          }
        );

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        
        // Update local user state after successful update
        setUser((prevUser) => ({ ...prevUser, username: newName }));
      } catch (error) {
        console.error("Failed to change username", error);
      }
    }
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setNewName(e.target.value);
  };

  // Filter and sort Ecos data
  const filteredAndSortedEcosData = () => {
    // Start with all data
    let filtered = [...ecosData];
    
    // Apply title search filter
    if (searchTerm) {
      filtered = filtered.filter(ecos => 
        ecos.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply theme filter
    if (selectedTheme) {
      filtered = filtered.filter(ecos => ecos.theme === selectedTheme);
    }
    
    // Apply date range filter
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(ecos => new Date(ecos.date) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Set to end of day
      filtered = filtered.filter(ecos => new Date(ecos.date) <= end);
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date) - new Date(a.date); // Sort by date descending
      }
      if (sortBy === "dateAsc") {
        return new Date(a.date) - new Date(b.date); // Sort by date ascending
      }
      if (sortBy === "theme") {
        return a.theme.localeCompare(b.theme); // Sort by theme alphabetically
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title); // Sort by title alphabetically
      }
      if (sortBy === "note") {
        return (b.note || 0) - (a.note || 0); // Sort by note descending
      }
      return 0;
    });
  };
  
  // Get the filtered and sorted data
  const displayData = filteredAndSortedEcosData();

  // Fonction pour formater la durée (secondes -> MM:SS)
  const formatDuration = (duration) => {
    if (!duration && duration !== 0) return "Non disponible";
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <h1 className="text-2xl font-bold mb-4 text-center text-black">Profil Utilisateur</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - User info */}
          <div className="md:col-span-1">
            <div className="flex flex-col items-center mb-4">
              <img
                src={user.avatar}
                alt="Profile"
                className="rounded-full w-24 h-24 object-cover mb-3"
              />
              <div className="w-full">
                <div className="mb-4">
                  <label className="block text-black font-bold">Nom</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={newName}
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
                    className="w-full px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                  >
                    Sauvegarder
                  </button>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="w-full px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                  >
                    Modifier
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Right column - Statistics and filters */}
          <div className="md:col-span-2">
            {/* Section Statistiques */}
            <div>
              <h2 className="text-xl font-semibold mb-2 text-black">Statistiques</h2>
              <p className="text-black mb-4">Nombre de tests effectués: {user.testsHistory.length}</p>

              {/* Ecos Data Filtering and Sorting */}
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title search filter */}
                  <div>
                    <label className="block text-black font-semibold">Filtrer par Titre:</label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                      placeholder="Rechercher par titre"
                    />
                  </div>

                  {/* Situation de départ filter */}
                  <div>
                    <label className="block text-black font-semibold">Filtrer par Situation de départ:</label>
                    <select
                      value={selectedTheme}
                      onChange={(e) => setSelectedTheme(e.target.value)}
                      className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                    >
                      <option value="">Toutes les situations de départ</option>
                      {availableThemes.map((theme) => (
                        <option key={theme} value={theme}>
                          {theme}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date range filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-black font-semibold">Date de début:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-black font-semibold">Date de fin:</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Sort options */}
                  <div>
                    <label className="block text-black font-semibold">Trier par:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 text-black"
                    >
                      <option value="date">Date (plus récent d'abord)</option>
                      <option value="dateAsc">Date (plus ancien d'abord)</option>
                      <option value="theme">Situation de départ</option>
                      <option value="title">Titre</option>
                      <option value="note">Note</option>
                    </select>
                  </div>
                  
                  {/* Reset filters button */}
                  <div className="flex items-end">
                    <button
                      onClick={resetFilters}
                      className="w-full px-4 py-2 text-white bg-gray-600 rounded hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                </div>

                {/* Displaying Ecos Data */}
                <div className="mt-6 mb-10">
                  {displayData.length === 0 ? (
                    <p className="text-black">Aucun résultat trouvé</p>
                  ) : (
                    displayData.map((ecos, index) => {
                      // Find matching test history entry to get transcription
                      const matchingTest = user.testsHistory.find(
                        test => test.idSujet?.toString() === ecos.id?.toString() && 
                                new Date(test.date).getTime() === new Date(ecos.date).getTime()
                      );
                      
                      return (
                        <div
                          key={`${ecos.testId || ecos.id}-${index}`}
                          className="mb-4 p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div className="text-black mb-3 md:mb-0">
                              <p>
                                <strong>Titre:</strong> {ecos.title}
                              </p>
                              <p>
                                <strong>Situation de départ:</strong> {ecos.theme}
                              </p>
                              <p>
                                <strong>Date:</strong> {new Date(ecos.date).toLocaleDateString()}
                              </p>
                              {ecos.note !== undefined && (
                                <p>
                                  <strong>Note:</strong> {ecos.note}
                                </p>
                              )}
                              {ecos.duration !== undefined && (
                                <p>
                                  <strong>Durée:</strong> {formatDuration(ecos.duration)}
                                </p>
                              )}
                            </div>
                            <button
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg- focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 w-full md:w-auto"
                              onClick={() => handleShowTranscription(index)}
                            >
                              {showTranscriptionIndex === index ? "Masquer transcription" : "Voir transcription"}
                            </button>
                          </div>
                          {/* Transcription Popup */}
                          {matchingTest?.transcription &&
                            matchingTest.transcription.length > 0 &&
                            showTranscriptionIndex === index && (
                              <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-black mb-2">Transcription:</h4>
                                {matchingTest.transcription.map((item, idx) => (
                                  <div key={idx} className="mt-2 pb-2 border-b border-gray-200 last:border-b-0">
                                    <p className="text-black">
                                      <strong>{(item.role == "chatgpt") ? "Patient" : "Vous"}:</strong> {item.content}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}