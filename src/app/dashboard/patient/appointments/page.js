"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiCalendar, FiClock, FiDollarSign, FiFileText, FiTrash2, FiLoader } from "react-icons/fi";
import Swal from "sweetalert2";

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  const fetchAppointments = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/appointments/patient`, {
        credentials: "include", headers: { ...(typeof localStorage !== "undefined" && localStorage.getItem("medico_auth_token") ? { Authorization: "Bearer " + localStorage.getItem("medico_auth_token") } : {}) }
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
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    Swal.fire({
      title: "Cancel Appointment?",
      text: "Are you sure you want to cancel this appointment request? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Cancel It"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          const response = await fetch(`${apiUrl}/api/appointments/${id}`, {
            method: "DELETE",
            credentials: "include", headers: { ...(typeof localStorage !== "undefined" && localStorage.getItem("medico_auth_token") ? { Authorization: "Bearer " + localStorage.getItem("medico_auth_token") } : {}) }
          });
          if (response.ok) {
            Swal.fire({
              icon: "success",
              title: "Cancelled",
              text: "Appointment has been successfully cancelled.",
              timer: 1500,
              showConfirmButton: false
            });
            fetchAppointments();
          } else {
            const err = await response.json();
            throw new Error(err.error || "Failed to cancel.");
          }
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  };



  const handlePayFee = async (appointmentId) => {
    setPayingId(appointmentId);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/payments/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", headers: { ...(typeof localStorage !== "undefined" && localStorage.getItem("medico_auth_token") ? { Authorization: "Bearer " + localStorage.getItem("medico_auth_token") } : {}) },
        body: JSON.stringify({ appointmentId })
      });
      const data = await response.json();
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to initiate payment.");
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
      setPayingId(null);
    }
  };

  const handleReschedule = async (id, currentDate, currentTime) => {
    Swal.fire({
      title: "Reschedule Appointment",
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">New Appointment Date</label>
            <input type="date" id="resched-date" class="swal2-input !mx-0 !w-full" value="${currentDate}" min="${new Date().toISOString().split("T")[0]}">
          </div>
          <div class="mt-3">
            <label class="block text-xs font-bold text-slate-500 mb-1">New Time Slot</label>
            <select id="resched-time" class="swal2-input !mx-0 !w-full">
              <option value="09:00 AM" ${currentTime === "09:00 AM" ? "selected" : ""}>09:00 AM</option>
              <option value="10:00 AM" ${currentTime === "10:00 AM" ? "selected" : ""}>10:00 AM</option>
              <option value="11:00 AM" ${currentTime === "11:00 AM" ? "selected" : ""}>11:00 AM</option>
              <option value="02:00 PM" ${currentTime === "02:00 PM" ? "selected" : ""}>02:00 PM</option>
              <option value="03:00 PM" ${currentTime === "03:00 PM" ? "selected" : ""}>03:00 PM</option>
              <option value="04:00 PM" ${currentTime === "04:00 PM" ? "selected" : ""}>04:00 PM</option>
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Reschedule",
      confirmButtonColor: "#059669",
      cancelButtonColor: "#64748b",
      preConfirm: () => {
        const date = document.getElementById("resched-date").value;
        const time = document.getElementById("resched-time").value;
        if (!date || !time) {
          Swal.showValidationMessage("Please select both date and time slot.");
        }
        return { appointmentDate: date, appointmentTime: time };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { appointmentDate, appointmentTime } = result.value;
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          const response = await fetch(`${apiUrl}/api/appointments/${id}/reschedule`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include", headers: { ...(typeof localStorage !== "undefined" && localStorage.getItem("medico_auth_token") ? { Authorization: "Bearer " + localStorage.getItem("medico_auth_token") } : {}) },
            body: JSON.stringify({ appointmentDate, appointmentTime })
          });
          if (response.ok) {
            Swal.fire({
              icon: "success",
              title: "Rescheduled",
              text: "Appointment has been successfully rescheduled.",
              timer: 1500,
              showConfirmButton: false
            });
            fetchAppointments();
          } else {
            const err = await response.json();
            throw new Error(err.error || "Failed to reschedule.");
          }
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      }
    });
  };

  const handleViewPrescription = async (appointmentId) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/prescriptions/appointment/${appointmentId}`, {
        credentials: "include", headers: { ...(typeof localStorage !== "undefined" && localStorage.getItem("medico_auth_token") ? { Authorization: "Bearer " + localStorage.getItem("medico_auth_token") } : {}) }
      });
      if (response.ok) {
        const data = await response.json();
        Swal.fire({
          title: `<span class="text-emerald-600 font-black">Medical Prescription</span>`,
          html: `
            <div class="text-left border border-slate-200 p-5 rounded-2xl bg-slate-50 space-y-4 text-sm mt-3">
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Consulting Doctor</p>
                <p class="font-bold text-slate-800">${data.doctorName || "Specialist"}</p>
              </div>
              <div class="border-t border-slate-200/60 pt-3">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Diagnosis</p>
                <p class="font-semibold text-slate-700 mt-0.5">${data.diagnosis}</p>
              </div>
              <div class="border-t border-slate-200/60 pt-3">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Medications</p>
                <p class="text-slate-600 leading-relaxed font-mono text-xs mt-0.5">${data.medications}</p>
              </div>
              <div class="border-t border-slate-200/60 pt-3">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doctor Notes</p>
                <p class="text-slate-600 leading-relaxed text-xs mt-0.5">${data.notes || "No special notes."}</p>
              </div>
              <div class="border-t border-slate-200/60 pt-3 text-[10px] text-slate-500 italic text-center">
                Date: ${new Date(data.createdAt).toLocaleDateString()}
              </div>
            </div>
          `,
          confirmButtonColor: "#059669",
          confirmButtonText: "Close"
        });
      } else {
        Swal.fire({
          icon: "info",
          title: "Prescription Pending",
          text: "The consulting doctor has not submitted a prescription for this session yet."
        });
      }
    } catch (error) {
      console.error("Prescription fetch error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <FiLoader className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 text-xs">Loading appointments list...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">My Appointments</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">View details, pay consultation fees, reschedule, or cancel slots.</p>
      </div>

      {appointments.length > 0 ? (
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
              <thead className="bg-slate-50 dark:bg-slate-950">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455">Doctor</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455">Date & Slot</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455 text-center">Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455 text-center">Payment</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {appointments.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white">{app.doctorName}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">{app.specialization}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                        <FiCalendar className="mr-1.5 shrink-0" /> {app.appointmentDate}
                      </div>
                      <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mt-1">
                        <FiClock className="mr-1.5 shrink-0" /> {app.appointmentTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        app.paymentStatus === "paid"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30"
                          : "bg-red-50 text-red-700 dark:bg-red-950/30"
                      }`}>
                        {app.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      {app.paymentStatus === "unpaid" && (
                        <>
                          <button
                            onClick={() => handlePayFee(app._id)}
                            disabled={payingId === app._id}
                            className="inline-flex items-center rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {payingId === app._id ? (
                              <><FiLoader className="animate-spin mr-1" /> Processing...</>
                            ) : (
                              <><FiDollarSign className="mr-1" /> Pay Fee (${app.consultationFee})</>
                            )}
                          </button>
                          <button
                            onClick={() => handleReschedule(app._id, app.appointmentDate, app.appointmentTime)}
                            className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-400 transition-colors cursor-pointer"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleCancel(app._id)}
                            className="inline-flex items-center rounded-xl border border-red-200 hover:bg-red-50 text-red-600 px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <FiTrash2 className="mr-1" /> Cancel
                          </button>
                        </>
                      )}

                      {app.paymentStatus === "paid" && app.appointmentStatus === "completed" && (
                        <button
                          onClick={() => handleViewPrescription(app._id)}
                          className="inline-flex items-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <FiFileText className="mr-1" /> View Prescription
                        </button>
                      )}

                      {app.paymentStatus === "paid" && app.appointmentStatus !== "completed" && (
                        <span className="text-xs text-slate-500 italic">Waiting Consultation</span>
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
          You have no booked appointments. Head over to{" "}
          <Link href="/doctors" className="text-emerald-600 font-bold hover:underline">
            Find Doctors
          </Link>{" "}
          to search specialists.
        </div>
      )}
    </div>
  );
}
