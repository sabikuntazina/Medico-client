"use client";

import { useEffect, useState } from "react";
import { FiCreditCard, FiCalendar, FiUser, FiHash, FiLoader } from "react-icons/fi";

export default function PatientPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/api/payments/patient`, {
          credentials: "include"
        });
        if (response.ok) {
          const data = await response.json();
          setPayments(data || []);
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <FiLoader className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 text-xs">Loading transaction history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Payment History</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">View and track all Stripe transaction receipts.</p>
      </div>

      {payments.length > 0 ? (
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
              <thead className="bg-slate-50 dark:bg-slate-950">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455">Transaction ID</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455">Doctor</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455">Payment Date</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-455 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {payments.map((pay) => (
                  <tr key={pay._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-900 dark:text-white flex items-center">
                      <FiHash className="mr-1.5 text-slate-400 shrink-0" /> {pay.transactionId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-700 dark:text-slate-400">
                      {pay.doctorName || "Specialist Consultant"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      <div className="flex items-center text-xs">
                        <FiCalendar className="mr-1.5 text-slate-400" />
                        {new Date(pay.paymentDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-black text-slate-950 dark:text-white">
                      ${pay.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 text-slate-400">
          No transactions registered on your profile yet.
        </div>
      )}
    </div>
  );
}
