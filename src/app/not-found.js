import Link from "next/link";
import { FiAlertCircle, FiHome } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      {/* Premium Visual Elements */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-emerald-500/20 dark:bg-emerald-400/10 blur-3xl rounded-full" />
        <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 mx-auto">
          <FiAlertCircle className="w-12 h-12 animate-bounce" />
        </div>
      </div>

      <h1 className="text-8xl font-black bg-gradient-to-r from-emerald-600 to-cyan-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-cyan-300">
        404
      </h1>
      
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mt-2">
        Page Not Found
      </h2>
      
      <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto text-sm leading-relaxed">
        Oops! The page you are looking for does not exist or has been moved. Let's get you back on track to finding the care you need.
      </p>

      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30"
        >
          <FiHome className="w-5 h-5" />
          <span>Back Home</span>
        </Link>
      </div>
    </div>
  );
}
