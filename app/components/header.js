import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-black text-white py-4 px-6 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo with home button */}
        <Link href="/">
          <button className="flex items-center bg-white p-2 rounded-full">
            <img src="/logo_tsp.png" alt="Logo" className="h-8" />
          </button>
        </Link>

        {/* Navigation */}
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/account" className="hover:text-gray-400 font-bold">Compte</Link>
            </li>
            <li>
              <Link href="/chat" className="hover:text-gray-400 font-bold">Entrainement</Link>
            </li>
            <li>
              <Link href="/soumettre" className="hover:text-gray-400 font-bold">Soumettre</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-gray-400 font-bold">Contact</Link>
            </li>
            <li>
              <Link href="/profil" className="hover:text-gray-400 font-bold">Profil</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
