import logo from "../assets/react.svg";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Header({ navBar = true }: { navBar?: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 group-hover:border-cyan-500/30 group-hover:bg-slate-900/80 transition-all duration-300">
            <img src={logo} alt="MRVAPE Logo" className="w-8 h-8 animate-[spin_8s_linear_infinite]" />
          </div>
          <h1 className="font-bold text-2xl tracking-tight text-white">
            MR<span className="text-cyan-400 font-extrabold drop-shadow-[0_0_8px_rgba(34,211,238,0.2)]">VAPE</span>
          </h1>
        </div>

        {/* Mobile menu button */}
        {navBar && (
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        )}

        {/* Desktop Navigation */}
        {navBar && (
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-slate-300 hover:text-white transition font-medium text-sm"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-slate-300 hover:text-white transition font-medium text-sm"
            >
              Products
            </Link>
            <a
              href="#contact"
              className="px-4 py-2 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-lg shadow-cyan-600/20 transition-all duration-200"
            >
              Contact Us
            </a>
          </nav>
        )}
      </div>

      {/* Mobile Navigation Panel */}
      {navBar && mobileMenuOpen && (
        <div className="md:hidden mt-4 p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 animate-fade-in">
          <Link
            to="/"
            className="block px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg font-medium transition"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="block px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg font-medium transition"
          >
            Products
          </Link>
          <a
            href="#contact"
            className="block w-full text-center px-4 py-2.5 font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition"
          >
            Contact Us
          </a>
        </div>
      )}
    </header>
  );
}
