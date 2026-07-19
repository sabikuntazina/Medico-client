"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "../lib/auth-client";
import ThemeToggle from "./ThemeToggle";
import { FiMenu, FiX, FiUser, FiLogOut, FiLayout } from "react-icons/fi";
import Swal from "sweetalert2";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      setIsProfileOpen(false);
      Swal.fire({
        icon: "success",
        title: "Logged Out",
        text: "You have successfully signed out.",
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: "top-end"
      });
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Find Doctors", href: "/doctors" },
    { name: "About Us", href: "/#about" },
    { name: "Contact Us", href: "/#contact" }
  ];

  const user = session?.user;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/75 dark:bg-slate-950/75 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-cyan-300">
                Medico
              </span>
              <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                Connect
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />

            {isPending ? (
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 focus:outline-none cursor-pointer"
                >
                  <img
                    src={user.image || user.photo || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover border-2 border-emerald-500"
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1 shadow-lg ring-1 ring-black/5 focus:outline-none transition-all">
                    <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-2">
                      <p className="text-sm font-semibold text-slate-950 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.25 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      href={`/dashboard/${user.role}`}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <FiLayout className="mr-2" /> Dashboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer"
                    >
                      <FiLogOut className="mr-2" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-700 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors shadow-sm dark:bg-emerald-500 dark:hover:bg-emerald-600"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 focus:outline-none cursor-pointer"
            >
              {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block rounded-lg px-3 py-2 text-base font-medium ${
                pathname === link.href
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                  : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="border-t border-slate-200 dark:border-slate-800 mt-4 pt-4">
            {isPending ? (
              <div className="h-10 w-full rounded bg-slate-100 dark:bg-slate-900 animate-pulse" />
            ) : user ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <img
                    src={user.image || user.photo || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover border border-emerald-500"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-950 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
                <Link
                  href={`/dashboard/${user.role}`}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left block rounded-lg px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 px-3">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
