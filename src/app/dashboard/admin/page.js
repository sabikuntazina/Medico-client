"use client";

import { useEffect, useState } from "react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { FiUsers, FiCalendar, FiDollarSign, FiStar, FiActivity, FiLoader } from "react-icons/fi";
import { FaUserMd } from "react-icons/fa";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        
        // Fetch all users
        const usersRes = await fetch(`${apiUrl}/api/users/all`);
        const usersData = await usersRes.json();
        
        // Fetch all doctors
        const docRes = await fetch(`${apiUrl}/api/doctors/all-admin`);
        const docData = await docRes.json();

        // Fetch all appointments
        const appRes = await fetch(`${apiUrl}/api/appointments/all`);
        const appData = await appRes.json();

        // Fetch all payments
        const payRes = await fetch(`${apiUrl}/api/payments/all`);
        const payData = await payRes.json();

        setUsers(usersData || []);
        setDoctors(docData || []);
        setAppointments(appData || []);
        setPayments(payData || []);
      } catch (error) {
        console.error("Error loading admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <FiLoader className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 text-xs">Loading analytics dashboard...</p>
      </div>
    );
  }

  // Calculation for counters
  const totalPatients = users.filter((u) => u.role === "patient").length;
  const totalDoctors = doctors.length;
  const totalAppointments = appointments.length;
  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  // Chart Data 1: Doctor Performance (top doctors by rating)
  const doctorPerformanceData = doctors
    .map((doc) => ({
      name: doc.doctorName.split(" ")[0] || "Dr.",
      rating: doc.averageRating || 0,
      fee: doc.consultationFee || 0
    }))
    .slice(0, 5); // top 5

  // Chart Data 2: Appointment Status Distribution
  const statusCounts = appointments.reduce((acc, app) => {
    acc[app.appointmentStatus] = (acc[app.appointmentStatus] || 0) + 1;
    return acc;
  }, {});

  const appointmentStatusData = [
    { name: "Pending", value: statusCounts.pending || 0 },
    { name: "Accepted", value: statusCounts.accepted || 0 },
    { name: "Completed", value: statusCounts.completed || 0 },
    { name: "Rejected", value: statusCounts.rejected || 0 }
  ].filter(item => item.value > 0);

  const PIE_COLORS = ["#f59e0b", "#06b6d4", "#10b981", "#ef4444"];

  // Chart Data 3: Revenue over time (recent 5 payments)
  const revenueHistoryData = payments
    .map((p) => ({
      date: new Date(p.paymentDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      amount: p.amount
    }))
    .reverse()
    .slice(-7); // last 7 transactions

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Hospital analytics, user lists, and transaction reports.</p>
      </div>

      {/* Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-650 dark:text-emerald-400 rounded-xl">
            <FiUsers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Patients</p>
            <p className="text-2xl font-black mt-0.5">{totalPatients}</p>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-650 dark:text-cyan-400 rounded-xl">
            <FaUserMd className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Doctors</p>
            <p className="text-2xl font-black mt-0.5">{totalDoctors}</p>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 rounded-xl">
            <FiCalendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Bookings</p>
            <p className="text-2xl font-black mt-0.5">{totalAppointments}</p>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 text-purple-650 dark:text-purple-400 rounded-xl">
            <FiDollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Earnings</p>
            <p className="text-2xl font-black mt-0.5">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Doctor Performance rating-based BarChart */}
        <div className="lg:col-span-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm">
          <h2 className="flex items-center text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6 border-b border-slate-100 dark:border-slate-850 pb-2">
            <FiActivity className="mr-1.5" /> Doctor Performance & Fee Metrics
          </h2>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={doctorPerformanceData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Legend iconType="circle" />
                <Bar yAxisId="left" dataKey="rating" name="Rating (Avg)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="fee" name="Fee ($)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Status PieChart */}
        <div className="lg:col-span-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm">
          <h2 className="flex items-center text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6 border-b border-slate-100 dark:border-slate-850 pb-2">
            <FiActivity className="mr-1.5" /> Appointment Distribution
          </h2>
          <div className="w-full h-80 relative flex items-center justify-center">
            {appointmentStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appointmentStatusData}
                    cx="50%"
                    cy="40%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {appointmentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 italic">No appointments booked yet.</p>
            )}
          </div>
        </div>

        {/* Stripe Revenue LineChart */}
        <div className="lg:col-span-12 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm">
          <h2 className="flex items-center text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6 border-b border-slate-100 dark:border-slate-850 pb-2">
            <FiActivity className="mr-1.5" /> Transaction Revenue Trend
          </h2>
          <div className="w-full h-80">
            {revenueHistoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueHistoryData}>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Legend iconType="circle" />
                  <Line type="monotone" dataKey="amount" name="Revenue ($)" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 italic py-20 text-center">No transaction records logged yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
