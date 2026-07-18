"use client";

import { useTheme } from "../context/ThemeContext";
import { FiSun, FiMoon } from "react-icons/fi";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
      aria-label="Toggle Theme"
    >
      {theme === "light" ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
    </button>
  );
}
