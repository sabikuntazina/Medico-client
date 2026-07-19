"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, saveAuthToken } from "../../lib/auth-client";
import Swal from "sweetalert2";
import { FiMail, FiLock, FiLoader } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please enter your email and password."
      });
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/auth/sign-in/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.message || data.error || "Invalid credentials.");
      }

      // ── Save token to localStorage for cross-domain auth ──
      const token = data.token || data?.session?.token;
      const user  = data.user;
      if (token && user) {
        saveAuthToken(token, user);
      } else {
        throw new Error("Login succeeded but no token received.");
      }

      Swal.fire({
        icon: "success",
        title: "Welcome Back!",
        text: "Log in successful.",
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: "top-end"
      });

      router.push(`/dashboard/${user.role}`);
    } catch (err) {
      console.error("Login error:", err);
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: err.message || "Invalid email or password."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/dashboard`
      });
    } catch (error) {
      console.error("Google sign in failed:", error);
      Swal.fire({
        icon: "error",
        title: "OAuth Failed",
        text: "Could not log in with Google."
      });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-6">
      <div className="max-w-md w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl relative overflow-hidden transition-all">
        
        {/* Decorative circle */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Sign in to access your doctor consultations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FiMail />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johndoe@example.com"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FiLock />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4 cursor-pointer"
          >
            {loading ? <FiLoader className="animate-spin w-5 h-5 mr-2" /> : "Sign In"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 dark:text-slate-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center py-3 px-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          <FcGoogle className="w-5 h-5 mr-2" />
          Google
        </button>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            New to Medico Connect?{" "}
            <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
