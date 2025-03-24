"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react"; // Icons for the hamburger menu

export default function Header() {
  const [logo, setLogo] = useState("/logos/logo_long.png");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null); // Reference for the menu

  // Close menu when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="text-white shadow-lg bg-[#171717]">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo */}
        <Link href="/">
          <img src={logo} alt="Logo" className="h-14" />
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={30} /> : <Menu size={30} />}
        </button>

        {/* Desktop Navigation */}
        <nav className={`md:flex space-x-6 bnr-font hidden z-20`}>
          <ul className="flex space-x-6">
            <li key="guide" className="hover:text-bnr-jaune">
              <Link href="/guide">Guide du participant</Link>
            </li>
            <li key="partenaires" className="hover:text-bnr-rose">
              <Link href="/partenaires">Partenaires</Link>
            </li>
            <li key="inscription" className="hover:text-bnr-bleu">
              <Link href="/inscription">Inscription</Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div ref={menuRef} className="md:hidden bg-[#21212182] text-white bnr-font mx-12">
          <ul className="flex flex-col space-y-4 p-4">
            <li key="mobile-guide" className="hover:text-bnr-jaune">
              <Link href="/guide" onClick={() => setIsMenuOpen(false)}>
                Guide du participant
              </Link>
            </li>
            <li key="mobile-partenaires" className="hover:text-bnr-rose">
              <Link href="/partenaires" onClick={() => setIsMenuOpen(false)}>
                Partenaires
              </Link>
            </li>
            <li key="mobile-inscription" className="hover:text-bnr-bleu">
              <Link href="/inscription" onClick={() => setIsMenuOpen(false)}>
                Inscription
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}