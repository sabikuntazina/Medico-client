"use client";

import { useEffect, useState } from "react";
import { FiTrash2, FiUserCheck, FiUserX, FiLoader } from "react-icons/fi";
import Swal from "sweetalert2";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/users/all`, {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleSuspend = async (id, currentStatus) => {
    const nextStatus = currentStatus === "suspended" ? "active" : "suspended";
    const actionLabel = currentStatus === "suspended" ? "Activate" : "Suspend";

    Swal.fire({
      title: `${actionLabel} User?`,
      text: `Are you sure you want to change user status to ${nextStatus}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: nextStatus === "active" ? "#059669" : "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: `Yes, ${actionLabel}`
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          const response = await fetch(`${apiUrl}/api/users/${id}/suspend`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ status: nextStatus })
          });
          if (response.ok) {
            Swal.fire({
              icon: "success",
              title: "Updated",
              text: `User status successfully updated to ${nextStatus}.`,
              timer: 1500,
              showConfirmButton: false
            });
            fetchUsers();
          } else {
            const err = await response.json();
            throw new Error(err.error || "Failed to update status.");
          }
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Delete User?",
      text: "Are you sure you want to permanently delete this user account? All sessions, accounts, and profile data will be destroyed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete It"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          const response = await fetch(`${apiUrl}/api/users/${id}`, {
            method: "DELETE",
            credentials: "include"
          });
          if (response.ok) {
            Swal.fire({
              icon: "success",
              title: "Deleted",
              text: "User profile successfully removed.",
              timer: 1500,
              showConfirmButton: false
            });
            fetchUsers();
          } else {
            const err = await response.json();
            throw new Error(err.error || "Failed to delete.");
          }
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <FiLoader className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 text-xs">Loading users database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Manage Users</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">View, suspend, or delete patient and doctor credentials.</p>
      </div>

      {users.length > 0 ? (
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
              <thead className="bg-slate-50 dark:bg-slate-950">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455">Profile</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455">Email</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455">Role</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455">Phone / Gender</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455 text-center">Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {users.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-3">
                      <img
                        src={item.image || item.photo || `https://api.dicebear.com/7.x/adventurer/svg?seed=${item.name}`}
                        alt={item.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                      />
                      <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {item.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        item.role === "doctor"
                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-cyan-50 text-cyan-805 dark:bg-cyan-950/40 dark:text-cyan-300"
                      }`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400 text-xs">
                      <div>{item.phone || "No phone"}</div>
                      <div className="text-[10px] text-slate-500 uppercase mt-0.5">{item.gender || "Not specified"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        item.status === "suspended"
                          ? "bg-red-50 text-red-700 dark:bg-red-950/30"
                          : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30"
                      }`}>
                        {item.status || "active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => handleToggleSuspend(item.id, item.status)}
                        className={`inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                          item.status === "suspended"
                            ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                        }`}
                      >
                        {item.status === "suspended" ? (
                          <>
                            <FiUserCheck className="mr-1" /> Activate
                          </>
                        ) : (
                          <>
                            <FiUserX className="mr-1" /> Suspend
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex items-center rounded-xl bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <FiTrash2 className="mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-center py-20 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900">
          No user accounts found.
        </p>
      )}
    </div>
  );
}
