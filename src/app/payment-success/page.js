"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FiCheckCircle, FiLoader, FiAlertCircle, FiArrowRight, FiCalendar } from "react-icons/fi";
import confetti from "canvas-confetti";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get("session_id");
  const appointmentId = searchParams.get("appointmentId");

  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!sessionId || !appointmentId) {
      setStatus("error");
      setErrorMsg("Missing payment session details.");
      return;
    }

    async function confirmPayment() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/api/payments/confirm-checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ sessionId, appointmentId })
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          // Fire confetti celebration
          setTimeout(() => {
            confetti({
              particleCount: 180,
              spread: 90,
              origin: { y: 0.5 },
              colors: ["#10b981", "#06b6d4", "#6366f1", "#f59e0b"]
            });
          }, 300);
        } else {
          setStatus("error");
          setErrorMsg(data.error || "Could not confirm your payment.");
        }
      } catch (err) {
        console.error("Payment confirmation error:", err);
        setStatus("error");
        setErrorMsg("Network error. Please contact support.");
      }
    }

    confirmPayment();
  }, [sessionId, appointmentId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 space-y-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-emerald-100 dark:border-emerald-950/50 flex items-center justify-center">
            <FiLoader className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Confirming Payment...</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm text-center">
          Please wait while we verify your transaction and confirm your appointment.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 space-y-6 px-4">
        <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
          <FiAlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Payment Issue</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">{errorMsg}</p>
        </div>
        <Link
          href="/dashboard/patient/appointments"
          className="inline-flex items-center px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 transition-opacity"
        >
          Go to My Appointments <FiArrowRight className="ml-2" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-emerald-500/10 p-10 text-center space-y-6">

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce-once">
            <FiCheckCircle className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Payment Successful!</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            Your consultation fee has been received. Your appointment is now <span className="font-bold text-emerald-600 dark:text-emerald-400">confirmed and accepted</span>.
          </p>
        </div>

        {/* Demo card note */}
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4 text-left space-y-1">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">What&apos;s Next?</p>
          <ul className="text-xs text-emerald-800 dark:text-emerald-300 space-y-1 mt-1">
            <li>✅ Appointment marked as accepted</li>
            <li>✅ Payment recorded in your history</li>
            <li>📋 Doctor will submit a prescription after consultation</li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard/patient/appointments"
            className="w-full flex items-center justify-center px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors shadow-md shadow-emerald-500/20"
          >
            <FiCalendar className="mr-2" /> View My Appointments
          </Link>
          <Link
            href="/doctors"
            className="w-full flex items-center justify-center px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm transition-colors"
          >
            Browse More Doctors
          </Link>
        </div>
      </div>

      {/* Medico branding */}
      <p className="mt-8 text-xs text-slate-400 dark:text-slate-600">
        Secured by <span className="font-bold text-emerald-600">Stripe</span> · Medico Healthcare
      </p>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <FiLoader className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
