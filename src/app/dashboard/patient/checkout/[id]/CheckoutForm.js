"use client";

import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import Swal from "sweetalert2";
import confetti from "canvas-confetti";
import { FiLock, FiLoader } from "react-icons/fi";

export default function CheckoutForm({ appointment, clientSecret, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    const card = elements.getElement(CardElement);

    try {
      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card,
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === "succeeded") {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/api/payments/confirm`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            appointmentId: appointment._id,
            transactionId: paymentIntent.id
          })
        });

        if (response.ok) {
          // Confetti!
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
          });

          Swal.fire({
            icon: "success",
            title: "Payment Successful!",
            text: "Your consultation has been booked and accepted.",
            confirmButtonColor: "#059669"
          });

          window.location.href = "/dashboard/patient/appointments";
        } else {
          throw new Error("Failed to confirm transaction on database.");
        }
      }
    } catch (err) {
      console.error("Stripe confirm error:", err);
      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text: err.message || "An unexpected error occurred during checkout."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950">
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Enter Card Details
        </label>
        <div className="p-3.5 border border-slate-250 bg-white rounded-xl">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '14px',
                  color: '#0f172a',
                  fontFamily: 'Outfit, sans-serif',
                  '::placeholder': {
                    color: '#94a3b8',
                  },
                },
                invalid: {
                  color: '#dc2626',
                },
              },
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 px-5 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3.5 shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-grow"
        >
          {loading ? (
            <>
              <FiLoader className="animate-spin w-4 h-4 mr-2" /> Processing...
            </>
          ) : (
            <>
              <FiLock className="mr-2" /> Pay ${appointment.consultationFee}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
