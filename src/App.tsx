import Header from "./components/Header";
import logo from "./assets/Logo.png";
import { useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();
  return (
    <div className="w-full bg-slate-950 text-slate-50 min-h-screen flex flex-col antialiased relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/2 right-10 w-[350px] h-[350px] bg-pink-500/5 rounded-full blur-[90px] pointer-events-none"></div>

      <Header />

      <main className="flex-1 flex flex-col justify-center items-center px-6 py-12 md:py-24 text-center max-w-4xl mx-auto z-10">
        <div className="inline-flex p-1.5 bg-slate-900/80 border border-slate-800/80 rounded-full mb-8 shadow-2xl animate-fade-in animate-float">
          <img
            src={logo}
            alt="MRVAPE Logo"
            className="w-24 h-24 md:w-32 md:h-32 animate-logo-pulse"
          />
        </div>

        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 animate-fade-in leading-[1.15]">
          Experience Vaping at its <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 drop-shadow-[0_0_20px_rgba(34,211,238,0.25)]">
            Absolute Finest
          </span>
        </h2>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
          Explore our curated selection of premium vape products. All listed
          items are available and ready for order.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
          <button
            className="w-full sm:w-auto px-8 py-3.5 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-semibold rounded-xl shadow-lg shadow-cyan-600/20 hover:shadow-cyan-600/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 cursor-pointer"
            onClick={() => navigate("/products")}
          >
            Browse Products
          </button>
          <button
            onClick={() => navigate("/contact")}
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-900/80 hover:bg-slate-900 hover:text-white border border-slate-800 rounded-xl font-semibold text-slate-300 transition-all duration-200 cursor-pointer"
          >
            Contact Sales
          </button>
        </div>
      </main>

      <footer className="w-full border-t border-slate-900 py-6 text-center text-xs text-slate-600 mt-auto">
        <p>© 2026 MRVAPE Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
