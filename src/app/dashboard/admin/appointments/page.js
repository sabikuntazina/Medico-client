"use client";

import { useEffect, useState } from "react";
import { FiCalendar, FiClock, FiDollarSign, FiUser, FiLoader } from "react-icons/fi";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/api/appointments/all`, {
          credentials: "include"
        });
        if (response.ok) {
          const data = await response.json();
          setAppointments(data || []);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <FiLoader className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 text-xs">Loading hospital bookings list...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">All Booked Appointments</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Monitor all hospital consultation schedules and payment statuses.</p>
      </div>

      {appointments.length > 0 ? (
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
              <thead className="bg-slate-50 dark:bg-slate-950">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455">Patient</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455">Doctor</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455">Date & Slot</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455 text-center">Payment Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455 text-center">Consultation Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455 text-right">Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {appointments.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white">{app.patientName}</div>
                      <div className="text-[10px] text-slate-450">{app.patientEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white">{app.doctorName}</div>
                      <div className="text-[10px] text-slate-450 uppercase tracking-wide font-medium">{app.specialization}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-xs text-slate-650 dark:text-slate-350">
                        <FiCalendar className="mr-1.5 shrink-0" /> {app.appointmentDate}
                      </div>
                      <div className="flex items-center text-xs text-slate-650 dark:text-slate-350 mt-1">
                        <FiClock className="mr-1.5 shrink-0" /> {app.appointmentTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        app.paymentStatus === "paid"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30"
                          : "bg-red-50 text-red-700 dark:bg-red-950/30"
                      }`}>
                        {app.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        app.appointmentStatus === "completed"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30"
                          : app.appointmentStatus === "accepted"
                          ? "bg-cyan-50 text-cyan-755 dark:bg-cyan-950/30"
                          : app.appointmentStatus === "rejected"
                          ? "bg-red-50 text-red-700 dark:bg-red-950/30"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/30"
                      }`}>
                        {app.appointmentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-black text-slate-950 dark:text-white">
                      ${app.consultationFee.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-center py-20 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900">
          No appointments logged in the system database.
        </p>
      )}
    </div>
  );
}
