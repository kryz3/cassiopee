export default function Home() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <div className="flex-grow px-8 py-8 text-center">
                {/* Titre */}
                <h1 className="text-4xl font-bold mb-6 text-black">Projet Cassiopée ECOS</h1>

                {/* Description */}
                <div className="text-center max-w-2xl mx-auto mb-8 space-y-4">
                    <p className="text-lg text-gray-800">
                        Ce site est développé dans le cadre d'un projet Cassiopée par <strong>Paul-Jean Girault</strong> et <strong>Quentin Nempont</strong>, élèves de l'école d'ingénieur
                        <strong> Télécom SudParis</strong>, pour les étudiants en médecine du
                        <strong> Centre Hospitalier Sud Francilien</strong>.
                    </p>
                    <p className="text-lg text-gray-800">
                        Notre objectif est de proposer une plateforme d'entraînement ECOS pour aider les étudiants en médecine à se préparer efficacement.
                    </p>
                </div>

                {/* Avertissement pour Firefox */}
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mx-auto max-w-2xl">
                    <p>⚠️ Ce site ne fonctionne pas encore sur Firefox, car il n'est pas compatible avec son moteur Gecko.</p>
                    <p>Il fonctionne correctement sur Safari et tous les navigateurs basés sur Chromium.</p>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-4 text-center">
                <p>&copy; {new Date().getFullYear()} Projet Cassiopée - Télécom SudParis</p>
            </footer>
        </div>
    );
}
