"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiUsers, FiCalendar, FiStar, FiActivity, FiArrowRight, FiLoader, FiClock, FiSettings } from "react-icons/fi";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDoctorDashboard() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        
        // Fetch doctor own profile
        const profRes = await fetch(`${apiUrl}/api/doctors/my-profile`, {
          credentials: "include"
        });
        if (profRes.ok) {
          const profData = await profRes.json();
          setDoctorProfile(profData);
          
          // Fetch appointments for doctor
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

  // Calculate statistics
  const paidAppointments = appointments.filter(a => a.paymentStatus === "paid");
  const uniquePatients = [...new Set(paidAppointments.map(a => a.patientId))].length;
  
  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const todaysAppointments = paidAppointments.filter(
    a => a.appointmentDate === todayStr && ["accepted", "pending"].includes(a.appointmentStatus)
  );

  const reviewsReceivedCount = doctorProfile?.totalReviews || 0;
  const averageRating = doctorProfile?.averageRating || 0;

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Doctor Dashboard Overview</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Manage consultations, calendars, and review feedback.</p>
      </div>

      {/* Profile Verification Notice */}
      {doctorProfile && doctorProfile.verificationStatus !== "verified" && (
        <div className="p-4 rounded-2xl border border-amber-250 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/10 text-amber-800 dark:text-amber-300 text-xs flex items-center space-x-2">
          <span>⚠️ <strong>Verification Pending:</strong> Your doctor profile is currently under review by our administrators. Please complete your professional biography and schedule slot configurations to expedite verification.</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Schedule</p>
            <p className="text-2xl font-black mt-0.5">{todaysAppointments.length}</p>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-xl">
            <FiStar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reviews Rating</p>
            <p className="text-2xl font-black mt-0.5 flex items-center">
              {averageRating} <span className="text-xs font-normal text-slate-400 ml-1.5">({reviewsReceivedCount} reviews)</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Today's Bookings */}
        <div className="lg:col-span-7 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Today's Appointments</h2>
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

        {/* Doctor Actions */}
        <div className="lg:col-span-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 text-left">
            Quick Actions
          </h2>
          
          <div className="space-y-4">
            <Link
              href="/dashboard/doctor/schedule"
              className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors"
            >
              <div className="flex items-center space-x-3 text-left">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 rounded-xl">
                  <FiClock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Configure Availability</h4>
                  <p className="text-[10px] text-slate-400">Set active days and slots</p>
                </div>
              </div>
              <FiArrowRight className="text-slate-500" />
            </Link>

            <Link
              href="/dashboard/doctor/profile"
              className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-cyan-500 dark:hover:border-cyan-400 transition-colors"
            >
              <div className="flex items-center space-x-3 text-left">
                <div className="p-3 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-450 rounded-xl">
                  <FiSettings className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Edit Professional Profile</h4>
                  <p className="text-[10px] text-slate-400">Add credentials & biography</p>
                </div>
              </div>
              <FiArrowRight className="text-slate-500" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
