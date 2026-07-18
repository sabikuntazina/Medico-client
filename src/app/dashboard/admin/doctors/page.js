"use client";

import { useEffect, useState } from "react";
import { FiCheck, FiX, FiRefreshCw, FiLoader } from "react-icons/fi";
import Swal from "sweetalert2";

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/doctors/all-admin`, {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setDoctors(data || []);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleVerifyStatus = async (id, status) => {
    let actionText = "verify";
    if (status === "rejected") actionText = "reject";
    if (status === "pending") actionText = "cancel verification for";

    Swal.fire({
      title: `Confirm Action`,
      text: `Are you sure you want to ${actionText} this doctor's credentials?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: status === "verified" ? "#059669" : status === "rejected" ? "#d33" : "#64748b",
      cancelButtonColor: "#64748b",
      confirmButtonText: `Yes, Proceed`
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          const response = await fetch(`${apiUrl}/api/doctors/${id}/verify`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ status })
          });
          if (response.ok) {
            Swal.fire({
              icon: "success",
              title: "Updated",
              text: `Doctor credentials status changed to ${status}.`,
              timer: 1500,
              showConfirmButton: false
            });
            fetchDoctors();
          } else {
            const err = await response.json();
            throw new Error(err.error || "Failed to verify status.");
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
        <p className="text-slate-500 dark:text-slate-400 text-xs">Loading doctors database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Verify Doctors</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Review credential verification requests for clinical practitioners.</p>
      </div>

      {doctors.length > 0 ? (
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
              <thead className="bg-slate-50 dark:bg-slate-950">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455">Doctor</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455">Specialization</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455">Qualifications</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455">Hospital / Exp</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455 text-center">Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {doctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                    <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-3">
                      <img
                        src={doc.profileImage || `https://api.dicebear.com/7.x/adventurer/svg?seed=${doc.doctorName}`}
                        alt={doc.doctorName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                      />
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{doc.doctorName}</div>
                        <div className="text-[9px] text-slate-400 uppercase tracking-wide">Fee: ${doc.consultationFee}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                        {doc.specialization || "Unset"}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-650 dark:text-slate-455">
                      {doc.qualifications?.join(", ") || "No credentials logged"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-650 dark:text-slate-400 text-xs">
                      <div>{doc.hospitalName || "Unset"}</div>
                      <div className="text-[10px] text-slate-450 mt-0.5">{doc.experience || 0} Years Exp</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        doc.verificationStatus === "verified"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30"
                          : doc.verificationStatus === "rejected"
                          ? "bg-red-50 text-red-700 dark:bg-red-950/30"
                          : "bg-amber-50 text-amber-705 dark:bg-amber-950/30"
                      }`}>
                        {doc.verificationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      {doc.verificationStatus !== "verified" && (
                        <button
                          onClick={() => handleVerifyStatus(doc._id, "verified")}
                          className="inline-flex items-center rounded-xl bg-emerald-650 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <FiCheck className="mr-1" /> Verify
                        </button>
                      )}
                      
                      {doc.verificationStatus !== "rejected" && (
                        <button
                          onClick={() => handleVerifyStatus(doc._id, "rejected")}
                          className="inline-flex items-center rounded-xl bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <FiX className="mr-1" /> Reject
                        </button>
                      )}

                      {doc.verificationStatus === "verified" && (
                        <button
                          onClick={() => handleVerifyStatus(doc._id, "pending")}
                          className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-350 transition-colors cursor-pointer"
                        >
                          <FiRefreshCw className="mr-1" /> Reset Status
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-center py-20 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900">
          No doctor profiles registered on the platform.
        </p>
      )}
    </div>
  );
}
