"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "../../lib/auth-context";
import { signOut, clearAuthToken } from "../../lib/auth-client";
import { 
  FiUser, 
  FiCalendar, 
  FiMessageSquare, 
  FiCreditCard, 
  FiActivity, 
  FiClock, 
  FiFileText, 
  FiSettings, 
  FiUsers, 
  FiLayers, 
  FiHome, 
  FiLogOut, 
  FiMenu, 
  FiX,
  FiLoader
} from "react-icons/fi";
import Swal from "sweetalert2";

export default function DashboardLayout({ children }) {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isPending) {
      if (!session?.user) {
        // Silently redirect to login without showing a popup
        router.replace("/login");
      } else {
        // Protect role routes
        const userRole = session.user.role;
        const currentPathRole = pathname.split("/")[2]; // /dashboard/[role]/...

        if (currentPathRole && currentPathRole !== userRole) {
          router.replace(`/dashboard/${userRole}`);
        }
      }
    }
  }, [session, isPending, pathname, router]);

  const handleLogout = async () => {
    try {
      // Clear localStorage token first
      clearAuthToken();
      // Then sign out from Better Auth (clears server cookie)
      await signOut().catch(() => {});
      Swal.fire({
        icon: "success",
        title: "Signed Out",
        text: "You have signed out successfully.",
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: "top-end"
      });
      router.push("/");
    } catch (err) {
      console.error("Signout error:", err);
    }
  };

  if (isPending || !session?.user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-slate-50 dark:bg-slate-950">
        <FiLoader className="w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold tracking-wide">
          Verifying your credentials...
        </p>
      </div>
    );
  }

  const user = session.user;

  // Sidebar Links config per Role
  const sidebarLinks = {
    patient: [
      { name: "Overview", href: "/dashboard/patient", icon: <FiActivity /> },
      { name: "My Appointments", href: "/dashboard/patient/appointments", icon: <FiCalendar /> },
      { name: "My Reviews", href: "/dashboard/patient/reviews", icon: <FiMessageSquare /> },
      { name: "Payment History", href: "/dashboard/patient/payments", icon: <FiCreditCard /> }
    ],
    doctor: [
      { name: "Overview", href: "/dashboard/doctor", icon: <FiActivity /> },
      { name: "Manage Schedule", href: "/dashboard/doctor/schedule", icon: <FiClock /> },
      { name: "Appointments", href: "/dashboard/doctor/appointments", icon: <FiCalendar /> },
      { name: "Prescriptions", href: "/dashboard/doctor/prescriptions", icon: <FiFileText /> },
      { name: "Edit Profile", href: "/dashboard/doctor/profile", icon: <FiSettings /> }
    ],
    admin: [
      { name: "Overview", href: "/dashboard/admin", icon: <FiActivity /> },
      { name: "Manage Users", href: "/dashboard/admin/users", icon: <FiUsers /> },
      { name: "Verify Doctors", href: "/dashboard/admin/doctors", icon: <FiLayers /> },
      { name: "All Appointments", href: "/dashboard/admin/appointments", icon: <FiCalendar /> },
      { name: "Transactions", href: "/dashboard/admin/payments", icon: <FiCreditCard /> }
    ]
  };

  const links = sidebarLinks[user.role] || [];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-200">
      
      {/* Sidebar Mobile Toggle Button */}
      <div className="lg:hidden absolute top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer shadow"
        >
          {sidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Drawer Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-grow">
          {/* Logo / Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800 justify-between">
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-cyan-300">
              Medico Dashboard
            </span>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-3 text-left">
            <img
              src={user.image || user.photo || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border border-emerald-500"
            />
            <div className="truncate">
              <h4 className="text-sm font-bold truncate">{user.name}</h4>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.25 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                {user.role}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-grow p-4 space-y-1 text-left">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md dark:bg-emerald-500"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                >
                  <span className="text-lg shrink-0">{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-left">
          <Link
            href="/"
            className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            <FiHome className="text-base" />
            <span>Back to Home</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300 transition-colors cursor-pointer"
          >
            <FiLogOut className="text-base" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Area */}
      <div className="flex-grow lg:pl-64 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between text-left shrink-0">
          <div className="pl-12 lg:pl-0">
            <h2 className="text-base font-bold text-slate-800 dark:text-white capitalize">
              Welcome, {user.name}!
            </h2>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{user.role} workspace</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">
              Today: {new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Dashboard Main Content */}
        <main className="flex-grow p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
