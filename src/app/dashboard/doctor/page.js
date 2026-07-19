"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FiUsers, FiCalendar, FiStar, FiActivity, FiArrowRight, 
  FiLoader, FiClock, FiSettings, FiDollarSign, FiAlertCircle,
  FiCheckCircle
} from "react-icons/fi";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDoctorDashboard() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        
        const profRes = await fetch(`${apiUrl}/api/doctors/my-profile`, {
          credentials: "include"
        });
        if (profRes.ok) {
          const profData = await profRes.json();
          setDoctorProfile(profData);
          
          const appRes = await fetch(`${apiUrl}/api/appointments/doctor`, {
            credentials: "include"
          });
          if (appRes.ok) {
            const appData = await appRes.json();
            setAppointments(appData || []);
          }
        }
      } catch (error) {
        console.error("Error loading doctor dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctorDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <FiLoader className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 text-xs">Loading dashboard data...</p>
      </div>
    );
  }

  const paidAppointments = appointments.filter(a => a.paymentStatus === "paid");
  const uniquePatients = [...new Set(paidAppointments.map(a => a.patientId))].length;
  
  const todayStr = new Date().toISOString().split("T")[0];
  const todaysAppointments = paidAppointments.filter(
    a => a.appointmentDate === todayStr && ["accepted", "pending"].includes(a.appointmentStatus)
  );

  const reviewsReceivedCount = doctorProfile?.totalReviews || 0;
  const averageRating = doctorProfile?.averageRating || 0;

  // Check if profile is incomplete
  const hasFee = doctorProfile?.consultationFee > 0;
  const hasHospital = !!doctorProfile?.hospitalName;
  const hasSlots = doctorProfile?.availableSlots?.length > 0;
  const hasDays = doctorProfile?.availableDays?.length > 0;
  const profileComplete = hasFee && hasHospital && hasSlots && hasDays;

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Doctor Dashboard Overview</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Manage consultations, calendars, and review feedback.</p>
      </div>

      {/* ── Profile Incomplete Setup Banner ── */}
      {!profileComplete && (
        <div className="border border-orange-200 dark:border-orange-900/40 bg-orange-50 dark:bg-orange-950/20 rounded-2xl p-5">
          <div className="flex items-start space-x-3">
            <FiAlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-orange-800 dark:text-orange-300">
                ⚠️ আপনার প্রোফাইল অসম্পূর্ণ — Patients আপনাকে বুক করতে পারবে না!
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                Patient দের appointment নিতে হলে নিচের তথ্যগুলো অবশ্যই পূরণ করতে হবে:
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className={`flex items-center space-x-2 text-xs font-semibold rounded-xl px-3 py-2 ${hasFee ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30" : "bg-red-50 text-red-700 dark:bg-red-950/30"}`}>
                  {hasFee ? <FiCheckCircle /> : <FiAlertCircle />}
                  <span>Visiting Fee {hasFee ? `($${doctorProfile.consultationFee})` : "(Not Set)"}</span>
                </div>
                <div className={`flex items-center space-x-2 text-xs font-semibold rounded-xl px-3 py-2 ${hasHospital ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30" : "bg-red-50 text-red-700 dark:bg-red-950/30"}`}>
                  {hasHospital ? <FiCheckCircle /> : <FiAlertCircle />}
                  <span>Hospital Name {hasHospital ? "✓" : "(Not Set)"}</span>
                </div>
                <div className={`flex items-center space-x-2 text-xs font-semibold rounded-xl px-3 py-2 ${hasDays ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30" : "bg-red-50 text-red-700 dark:bg-red-950/30"}`}>
                  {hasDays ? <FiCheckCircle /> : <FiAlertCircle />}
                  <span>Available Days {hasDays ? `(${doctorProfile.availableDays.length} days)` : "(Not Set)"}</span>
                </div>
                <div className={`flex items-center space-x-2 text-xs font-semibold rounded-xl px-3 py-2 ${hasSlots ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30" : "bg-red-50 text-red-700 dark:bg-red-950/30"}`}>
                  {hasSlots ? <FiCheckCircle /> : <FiAlertCircle />}
                  <span>Time Slots {hasSlots ? `(${doctorProfile.availableSlots.length} slots)` : "(Not Set)"}</span>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Link
                  href="/dashboard/doctor/profile"
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors"
                >
                  <FiDollarSign className="mr-1.5" /> Set Visiting Fee & Profile
                </Link>
                <Link
                  href="/dashboard/doctor/schedule"
                  className="inline-flex items-center px-4 py-2 rounded-xl border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-950/40 font-bold text-xs transition-colors"
                >
                  <FiClock className="mr-1.5" /> Set Schedule & Slots
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Notice */}
      {doctorProfile && doctorProfile.verificationStatus !== "verified" && (
        <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/10 text-amber-800 dark:text-amber-300 text-xs flex items-center space-x-2">
          <span>🔍 <strong>Verification Pending:</strong> Admin আপনার profile review করছে। Profile সম্পূর্ণ করুন — verification দ্রুত হবে।</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <FiUsers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Patients</p>
            <p className="text-2xl font-black mt-0.5">{uniquePatients}</p>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 rounded-xl">
            <FiCalendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today&apos;s Schedule</p>
            <p className="text-2xl font-black mt-0.5">{todaysAppointments.length}</p>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-xl">
            <FiStar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rating</p>
            <p className="text-2xl font-black mt-0.5 flex items-baseline">
              {averageRating} <span className="text-xs font-normal text-slate-400 ml-1">({reviewsReceivedCount})</span>
            </p>
          </div>
        </div>

        {/* Visiting Fee Card */}
        <Link
          href="/dashboard/doctor/profile"
          className="border-2 border-dashed border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10 hover:border-emerald-400 dark:hover:border-emerald-600 rounded-2xl p-5 shadow-sm flex items-center space-x-4 transition-colors group"
        >
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:bg-emerald-200 transition-colors">
            <FiDollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Visiting Fee</p>
            {hasFee ? (
              <p className="text-2xl font-black mt-0.5 text-emerald-600 dark:text-emerald-400">${doctorProfile.consultationFee}</p>
            ) : (
              <p className="text-sm font-bold mt-0.5 text-orange-500">Not Set — Click!</p>
            )}
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Today's Bookings */}
        <div className="lg:col-span-7 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Today&apos;s Appointments</h2>
            <Link 
              href="/dashboard/doctor/appointments" 
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center"
            >
              All Appointments <FiArrowRight className="ml-1" />
            </Link>
          </div>

          {todaysAppointments.length > 0 ? (
            <div className="space-y-4 text-xs font-semibold text-slate-600">
              {todaysAppointments.map((app) => (
                <div 
                  key={app._id} 
                  className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-2xl text-left"
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{app.patientName}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{app.patientEmail}</p>
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center">
                      <FiClock className="mr-1" /> {app.appointmentTime}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30">
                    {app.appointmentStatus}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-6 text-center">
              No appointments scheduled for today.
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Quick Actions
          </h2>
          
          <div className="space-y-3">
            {/* Set Visiting Fee — most important */}
            <Link
              href="/dashboard/doctor/profile"
              className="flex items-center justify-between p-4 rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/10 hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors"
            >
              <div className="flex items-center space-x-3 text-left">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <FiDollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Set Visiting Fee & Profile</h4>
                  <p className="text-[10px] text-slate-500">
                    {hasFee ? `Current fee: $${doctorProfile.consultationFee} — Click to update` : "⚠️ Visiting fee not set yet!"}
                  </p>
                </div>
              </div>
              <FiArrowRight className="text-emerald-500 shrink-0" />
            </Link>

            <Link
              href="/dashboard/doctor/schedule"
              className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-cyan-500 dark:hover:border-cyan-400 transition-colors"
            >
              <div className="flex items-center space-x-3 text-left">
                <div className="p-3 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-450 rounded-xl">
                  <FiClock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Configure Schedule</h4>
                  <p className="text-[10px] text-slate-400">
                    {hasDays && hasSlots ? `${doctorProfile.availableDays.length} days, ${doctorProfile.availableSlots.length} slots set` : "Set active days and time slots"}
                  </p>
                </div>
              </div>
              <FiArrowRight className="text-slate-500 shrink-0" />
            </Link>

            <Link
              href="/dashboard/doctor/appointments"
              className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-purple-400 dark:hover:border-purple-400 transition-colors"
            >
              <div className="flex items-center space-x-3 text-left">
                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-xl">
                  <FiActivity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">View Appointments</h4>
                  <p className="text-[10px] text-slate-400">Accept, reject, or complete consultations</p>
                </div>
              </div>
              <FiArrowRight className="text-slate-500 shrink-0" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
