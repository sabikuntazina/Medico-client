"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiCheck, FiX, FiCheckCircle, FiClock, FiCalendar, FiUser, FiLoader } from "react-icons/fi";
import Swal from "sweetalert2";

export default function DoctorAppointments() {
  const router = useRouter();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/appointments/doctor`, {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setAppointments(data || []);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    const actionLabel = status === "accepted" ? "Accept" : "Reject";
    
    Swal.fire({
      title: `${actionLabel} Appointment?`,
      text: `Are you sure you want to change status to ${status}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: status === "accepted" ? "#059669" : "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: `Yes, ${actionLabel}`
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          const response = await fetch(`${apiUrl}/api/appointments/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ status })
          });
          if (response.ok) {
            Swal.fire({
              icon: "success",
              title: "Updated",
              text: `Appointment request has been ${status}.`,
              timer: 1500,
              showConfirmButton: false
            });
            fetchAppointments();
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

  const handleMarkCompleted = async (appId, patientId) => {
    Swal.fire({
      title: "Mark Consultation Completed?",
      text: "This will complete the session. You will be redirected to write a prescription for the patient.",
      icon: "success",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Complete Session"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          const response = await fetch(`${apiUrl}/api/appointments/${appId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ status: "completed" })
          });
          if (response.ok) {
            Swal.fire({
              icon: "success",
              title: "Marked Completed!",
              text: "Loading prescription form.",
              timer: 1500,
              showConfirmButton: false
            });
            
            // Navigate to prescription route with params
            router.push(`/dashboard/doctor/prescriptions?appointmentId=${appId}&patientId=${patientId}`);
          } else {
            const err = await response.json();
            throw new Error(err.error || "Failed to complete appointment.");
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
        <p className="text-slate-500 dark:text-slate-400 text-xs">Loading appointments schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Appointment Requests</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Review patient slot bookings and mark sessions completed.</p>
      </div>

      {appointments.length > 0 ? (
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
              <thead className="bg-slate-50 dark:bg-slate-950">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455">Patient</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455">Date & Slot</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455">Symptoms Description</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455 text-center">Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {appointments.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white">{app.patientName}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{app.patientEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                        <FiCalendar className="mr-1.5 shrink-0" /> {app.appointmentDate}
                      </div>
                      <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mt-1">
                        <FiClock className="mr-1.5 shrink-0" /> {app.appointmentTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-600 dark:text-slate-400">
                      {app.symptoms || "No details provided."}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="space-y-1">
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          app.appointmentStatus === "completed"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30"
                            : app.appointmentStatus === "accepted"
                            ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30"
                            : app.appointmentStatus === "rejected"
                            ? "bg-red-50 text-red-700 dark:bg-red-950/30"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/30"
                        }`}>
                          {app.appointmentStatus}
                        </span>
                        <div>
                          <span className={`inline-block text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.25 rounded ${
                            app.paymentStatus === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-805"
                          }`}>
                            {app.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      {app.paymentStatus === "paid" && app.appointmentStatus === "pending" && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(app._id, "accepted")}
                            className="inline-flex items-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <FiCheck className="mr-1" /> Accept
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(app._id, "rejected")}
                            className="inline-flex items-center rounded-xl bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <FiX className="mr-1" /> Reject
                          </button>
                        </>
                      )}

                      {app.paymentStatus === "paid" && app.appointmentStatus === "accepted" && (
                        <button
                          onClick={() => handleMarkCompleted(app._id, app.patientId)}
                          className="inline-flex items-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <FiCheckCircle className="mr-1" /> Mark Completed
                        </button>
                      )}

                      {app.paymentStatus === "unpaid" && (
                        <span className="text-xs text-slate-400 italic">Unpaid request</span>
                      )}

                      {app.appointmentStatus === "completed" && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-end">
                          <FiCheckCircle className="mr-1" /> Consulted
                        </span>
                      )}

                      {app.appointmentStatus === "rejected" && (
                        <span className="text-xs text-red-500 font-bold">Rejected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 text-slate-400">
          No booked consultation requests found on your schedule.
        </div>
      )}
    </div>
  );
}
