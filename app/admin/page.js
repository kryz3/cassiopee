'use client';

import { useEffect, useState } from 'react';

export default function EcosPage() {
  const [ecoss, setEcoss] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [themeFilter, setThemeFilter] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [visibleImages, setVisibleImages] = useState({});

  useEffect(() => {
    fetch('http://localhost:5001/Ecos/api/getEcoss')
      .then((res) => res.json())
      .then((data) => {
        const sorted = [...data].sort((a, b) => b._id.localeCompare(a._id));
        setEcoss(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erreur lors de la récupération des ECOS:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = [...ecoss];

    if (search) {
      result = result.filter((e) =>
        e.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (themeFilter) {
      result = result.filter((e) => e.theme === themeFilter);
    }

    setFiltered(result);
  }, [ecoss, search, themeFilter]);

  const toggleImage = (id) => {
    setVisibleImages((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDelete = async (id) => {
    if (!confirm('❗ Es-tu sûr de vouloir supprimer cet ECOS ?')) return;

    try {
      const response = await fetch('http://localhost:5001/Ecos/api/deleteEcos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (response.ok) {
        setEcoss((prev) => prev.filter((e) => e._id !== id));
        alert('✅ ECOS supprimé avec succès.');
      } else {
        alert('❌ Erreur : ' + result.error);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('❌ Erreur lors de la suppression.');
    }
  };

  const allThemes = Array.from(new Set(ecoss.map((e) => e.theme).filter(Boolean)));

  if (loading) return <div className="p-4 text-center text-black">Chargement...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-black mb-10">
      <h1 className="text-4xl font-bold mb-6 text-center">📋 ECOS</h1>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-xl shadow-md space-y-4 max-w-4xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="🔎 Rechercher par titre"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full text-black bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={themeFilter || ''}
            onChange={(e) => setThemeFilter(e.target.value || null)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full text-black bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">🎨 Tous les thèmes</option>
            {allThemes.map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            setSearch('');
            setThemeFilter(null);
          }}
          className="text-sm text-blue-600 underline hover:text-blue-800 transition"
        >
          Réinitialiser les filtres
        </button>
      </div>

      {/* Résultats */}
      <div className="grid gap-6 max-w-5xl mx-auto">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-600">Aucun ECOS trouvé.</p>
        ) : (
          filtered.map((ecos) => (
            <div
              key={ecos._id}
              className="bg-white rounded-2xl shadow-md p-6 transition hover:shadow-xl"
            >
              <h2 className="text-2xl font-semibold mb-2">{ecos.title}</h2>
              <p className="text-gray-700 mb-1"><strong>Étudiant :</strong> {ecos.consigneEtudiant}</p>
              <p className="text-gray-700 mb-1"><strong>Patient :</strong> {ecos.consignesPourPatient}</p>
              {ecos.theme && (
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mt-2 mb-3">
                  {ecos.theme}
                </span>
              )}

              {ecos.image && (
                <div className="mt-4">
                  <button
                    onClick={() => toggleImage(ecos._id)}
                    className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition"
                  >
                    {visibleImages[ecos._id] ? 'Masquer l’image' : 'Voir l’image'}
                  </button>
                  {visibleImages[ecos._id] && (
                    <div className="mt-3">
                      <img
                        src={`/ecos/${ecos.image}`}
                        alt="ECOS"
                        className="w-full max-h-64 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                        onClick={() => setSelectedImage(ecos.image)}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4">
                <h3 className="font-semibold mb-1">Grille d’évaluation :</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {ecos.grilleEvaluation.map((item, idx) => (
                    <li key={idx}>
                      {item.consigne} – <strong>{item.note}</strong>/10
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bouton Supprimer */}
              <div className="mt-6 text-right">
                <button
                  onClick={() => handleDelete(ecos._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Popup image */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={`/ecos/${selectedImage}`}
            alt="Zoom"
            className="max-w-full max-h-[90vh] rounded-xl shadow-xl"
          />
        </div>
      )}
    </div>
  );
}
