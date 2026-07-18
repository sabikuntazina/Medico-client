"use client";

import { Suspense } from "react";
import PrescriptionsPanel from "./PrescriptionsPanel";
import { FiLoader } from "react-icons/fi";

export default function DoctorPrescriptions() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
          <FiLoader className="w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold tracking-wide animate-pulse">
            Loading prescription records...
          </p>
        </div>
      }
    >
      <PrescriptionsPanel />
    </Suspense>
  );
}
