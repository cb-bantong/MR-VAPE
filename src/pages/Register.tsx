import Header from "../components/Header.tsx";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ConvexError } from "convex/values";
import logo from "../assets/react.svg";

export default function Register() {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const MySwal = withReactContent(Swal);

  const showSwalAlert = (title: string, text: string, icon: "success" | "error" | "warning") => {
    return MySwal.fire({
      title,
      text,
      icon,
      background: "#0d121e",
      color: "#f3f4f6",
      confirmButtonText: "OK",
      buttonsStyling: false,
      customClass: {
        confirmButton:
          "px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-semibold rounded-xl shadow-lg shadow-cyan-600/20 hover:shadow-cyan-600/30 transition-all duration-200 outline-none text-sm cursor-pointer",
        popup: "border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md",
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !passwordConfirm.trim()
    ) {
      showSwalAlert("Validation Error", "Please fill in all fields.", "warning");
      return;
    }

    if (password.length < 8) {
      showSwalAlert("Validation Error", "Password must be at least 8 characters long.", "warning");
      return;
    }

    if (password !== passwordConfirm) {
      showSwalAlert("Validation Error", "Passwords do not match.", "warning");
      return;
    }

    try {
      setIsLoading(true);
      await signIn("password", {
        name,
        email,
        password,
        flow: "signUp",
      });

      setIsLoading(false);
      await MySwal.fire({
        title: "Registration Successful",
        text: "Your account is pending admin approval. You will be redirected.",
        icon: "success",
        background: "#0d121e",
        color: "#f3f4f6",
        confirmButtonText: "Okay",
        buttonsStyling: false,
        customClass: {
          confirmButton:
            "px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-semibold rounded-xl shadow-lg shadow-cyan-600/20 hover:shadow-cyan-600/30 transition-all duration-200 outline-none text-sm cursor-pointer",
          popup: "border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md",
        },
      });
      navigate("/dashboard");
    } catch (error) {
      setIsLoading(false);
      console.error("Registration error:", error);
      let message = "An error occurred while registering. Please try again.";
      if (error instanceof ConvexError) {
        message = error.data as string;
      } else if (error instanceof Error) {
        message = error.message;
      }
      showSwalAlert("Registration Failed", message, "error");
    }
  };

  return (
    <div className="bg-slate-950 w-full min-h-screen antialiased flex flex-col">
      <Header navBar={false} />
      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-10 left-1/3 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl relative z-10 animate-fade-in border border-slate-800/80">
          <div className="text-center space-y-3 mb-6">
            <div className="inline-flex p-3 bg-slate-900/80 border border-slate-800 rounded-2xl mb-1">
              <img src={logo} alt="Logo" className="w-10 h-10 animate-[spin_12s_linear_infinite]" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Create Account
            </h1>
            <p className="text-sm text-slate-400">
              Sign up to request dashboard access
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 input-premium text-white placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 input-premium text-white placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block" htmlFor="password">
                Password (min. 8 characters)
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 input-premium text-white placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block" htmlFor="passwordConfirm">
                Confirm Password
              </label>
              <input
                id="passwordConfirm"
                type="password"
                name="passwordConfirm"
                placeholder="••••••••"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 input-premium text-white placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-semibold rounded-xl shadow-lg shadow-cyan-600/20 hover:shadow-cyan-600/30 transition-all-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none mt-6"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register</span>
              )}
            </button>
          </form>

          <div className="border-t border-slate-800/80 mt-6 pt-6 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition hover:underline">
                Sign In instead
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
