"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { FiCreditCard, FiCalendar, FiClock, FiActivity, FiLoader } from "react-icons/fi";
import Swal from "sweetalert2";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();

  const [clientSecret, setClientSecret] = useState("");
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPaymentIntent() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/api/payments/create-intent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ appointmentId: id })
        });
        const resData = await response.json();
        
        if (response.ok) {
          setClientSecret(resData.clientSecret);
          setAppointment(resData.appointment);
        } else {
          Swal.fire({
            icon: "error",
            title: "Checkout Error",
            text: resData.error || "Unable to initialize Stripe checkout."
          });
          router.push("/dashboard/patient/appointments");
        }
      } catch (error) {
        console.error("Error creating payment intent:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPaymentIntent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <FiLoader className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 text-xs">Initializing secure checkout session...</p>
      </div>
    );
  }

  if (!clientSecret || !appointment) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Secure Payment Portal</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Complete payment to finalize slot reservation.</p>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Booking Brief */}
        <div className="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 rounded-xl">
              <FiActivity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">{appointment.doctorName}</h3>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{appointment.specialization} Consultant</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-650 dark:text-slate-350 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl">
            <div className="flex items-center">
              <FiCalendar className="mr-2 text-slate-400" /> {appointment.appointmentDate}
            </div>
            <div className="flex items-center">
              <FiClock className="mr-2 text-slate-400" /> {appointment.appointmentTime}
            </div>
          </div>
        </div>

        {/* Stripe Elements Provider */}
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm 
            appointment={appointment} 
            clientSecret={clientSecret} 
            onCancel={() => router.push("/dashboard/patient/appointments")}
          />
        </Elements>

        {/* Security badge */}
        <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-450 pt-2 border-t border-slate-100 dark:border-slate-850">
          <FiCreditCard className="w-4 h-4" />
          <span>SSL Secured Stripe transaction. Your credentials are never stored.</span>
        </div>

      </div>
    </div>
  );
}
