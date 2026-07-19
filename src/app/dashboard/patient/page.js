"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "../../../lib/auth-context";
import { 
  FiCalendar, 
  FiCreditCard, 
  FiClock, 
  FiActivity, 
  FiChevronRight, 
  FiPlusCircle,
  FiHelpCircle,
  FiSend,
  FiLoader
} from "react-icons/fi";
import Swal from "sweetalert2";

export default function PatientDashboard() {
  const { data: session } = useSession();
  const user = session?.user;

  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gemini AI Diagnostic Helper state
  const [symptomsInput, setSymptomsInput] = useState("");
  const [aiDiagnosis, setAiDiagnosis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        
        // Fetch appointments
        const appRes = await fetch(`${apiUrl}/api/appointments/patient`, {
          credentials: "include", headers: { ...(typeof localStorage !== "undefined" && localStorage.getItem("medico_auth_token") ? { Authorization: "Bearer " + localStorage.getItem("medico_auth_token") } : {}) }
        });
        if (appRes.ok) {
          const appData = await appRes.json();
          setAppointments(appData || []);
        }

        // Fetch payments
        const payRes = await fetch(`${apiUrl}/api/payments/patient`, {
          credentials: "include", headers: { ...(typeof localStorage !== "undefined" && localStorage.getItem("medico_auth_token") ? { Authorization: "Bearer " + localStorage.getItem("medico_auth_token") } : {}) }
        });
        if (payRes.ok) {
          const payData = await payRes.json();
          setPayments(payData || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const handleAiDiagnose = async (e) => {
    e.preventDefault();
    if (!symptomsInput.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Input Required",
        text: "Please describe what symptoms you are experiencing."
      });
      return;
    }

    setAiLoading(true);
    setAiDiagnosis(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/ai/diagnose`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", headers: { ...(typeof localStorage !== "undefined" && localStorage.getItem("medico_auth_token") ? { Authorization: "Bearer " + localStorage.getItem("medico_auth_token") } : {}) },
        body: JSON.stringify({ symptoms: symptomsInput })
      });

      const data = await response.json();

      if (response.ok && !data.error) {
        setAiDiagnosis(data);
      } else {
        // Show actual error from server for debugging
        const errMsg = data.message || data.error || "AI service failed.";
        Swal.fire({
          icon: "error",
          title: "AI Assistant Error",
          html: `<p class="text-sm text-slate-600 text-left">${errMsg}</p>`,
          confirmButtonColor: "#059669"
        });
      }
    } catch (error) {
      console.error("AI Diagnose error:", error);
      Swal.fire({
        icon: "error",
        title: "Connection Error",
        text: "Could not reach the server. Make sure your backend is running on port 5000."
      });
    } finally {
      setAiLoading(false);
    }
  };

  const paidAppointments = appointments.filter((app) => app.paymentStatus === "paid");
  const upcomingAppointments = appointments.filter(
    (app) => app.paymentStatus === "paid" && ["pending", "accepted"].includes(app.appointmentStatus)
  );

  const totalSpent = payments.reduce((acc, p) => acc + Number(p.amount), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <FiLoader className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 text-xs">Loading dashboard overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Patient Dashboard Overview</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Track and schedule your healthcare consultations.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <FiCalendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upcoming Bookings</p>
            <p className="text-2xl font-black mt-0.5">{upcomingAppointments.length}</p>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 rounded-xl">
            <FiClock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Consulted</p>
            <p className="text-2xl font-black mt-0.5">{paidAppointments.length}</p>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <FiCreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Payments</p>
            <p className="text-2xl font-black mt-0.5">${totalSpent.toFixed(2)}</p>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-xl">
            <FiActivity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saved Doctors</p>
            <p className="text-2xl font-black mt-0.5">{[...new Set(appointments.map(a => a.doctorId))].length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Gemini AI Diagnostic Assistant */}
        <div className="lg:col-span-7 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-lg">
              <FiHelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Medico AI Symptom Assistant</h2>
              <p className="text-[10px] text-slate-400 font-medium">Powered by Gemini - Instant specialist recommendation</p>
            </div>
          </div>

          <form onSubmit={handleAiDiagnose} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Describe Your Symptoms
              </label>
              <textarea
                value={symptomsInput}
                onChange={(e) => setSymptomsInput(e.target.value)}
                placeholder="Examples: 'I have chest pressure when walking up stairs' or 'I have a red, itchy rash on my face'..."
                rows="3"
                className="block w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-2xl text-sm p-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={aiLoading}
              className="flex items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-750 text-white font-semibold text-xs px-5 py-3 shadow-md shadow-purple-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {aiLoading ? (
                <>
                  <FiLoader className="animate-spin w-4 h-4 mr-2" /> Analysing...
                </>
              ) : (
                <>
                  <FiSend className="mr-2" /> Get Recommendation
                </>
              )}
            </button>
          </form>

          {/* AI Result Presentation */}
          {aiDiagnosis && (
            <div className="border border-purple-100 dark:border-purple-900/40 bg-purple-50/20 dark:bg-purple-950/10 rounded-2xl p-5 space-y-4 animate-fade-in text-sm">
              <div className="space-y-1">
                <p className="text-xs font-bold text-purple-700 dark:text-purple-400">Medico AI Response:</p>
                <p className="text-slate-600 dark:text-slate-400 italic">"{aiDiagnosis.empathy}"</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Symptom Summary</span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">{aiDiagnosis.summary}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Recommended SPECIALTY</span>
                  <span className="inline-block text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {aiDiagnosis.specialization}
                  </span>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Clinical Rationale</span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">{aiDiagnosis.reason}</p>
              </div>

              <div className="space-y-1 pt-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Self-Care Suggestions</span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">{aiDiagnosis.advice}</p>
              </div>

              <div className="border-t border-purple-100 dark:border-purple-900/30 pt-3 text-[10px] text-slate-400 italic">
                {aiDiagnosis.disclaimer}
              </div>

              {/* Dynamic Call-to-Action Booking Button */}
              <div className="pt-2">
                <Link
                  href={`/doctors?specialization=${aiDiagnosis.specialization === "General" ? "All" : aiDiagnosis.specialization}`}
                  className="inline-flex items-center space-x-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-emerald-500/15"
                >
                  <span>Book a {aiDiagnosis.specialization === "General" ? "General Physician" : aiDiagnosis.specialization} Doctor</span>
                  <FiChevronRight />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Favorite/Recent Doctors */}
        <div className="lg:col-span-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Quick Actions</h2>
          </div>

          <div className="space-y-4">
            <Link
              href="/doctors"
              className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors"
            >
              <div className="flex items-center space-x-3 text-left">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <FiPlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Book New Consultation</h4>
                  <p className="text-[10px] text-slate-400">Search specialized practitioners</p>
                </div>
              </div>
              <FiChevronRight className="text-slate-400" />
            </Link>

            <Link
              href="/dashboard/patient/appointments"
              className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-cyan-500 dark:hover:border-cyan-400 transition-colors"
            >
              <div className="flex items-center space-x-3 text-left">
                <div className="p-3 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 rounded-xl">
                  <FiCalendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Manage Appointments</h4>
                  <p className="text-[10px] text-slate-400">Reschedule or pay consultation fee</p>
                </div>
              </div>
              <FiChevronRight className="text-slate-400" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
