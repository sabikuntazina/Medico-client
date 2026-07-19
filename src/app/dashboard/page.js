"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../lib/auth-context";
import { FiLoader } from "react-icons/fi";

export default function DashboardRedirect() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending) {
      if (session?.user) {
        router.replace(`/dashboard/${session.user.role}`);
      } else {
        router.replace("/login");
      }
    }
  }, [session, isPending, router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <FiLoader className="w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold tracking-wide animate-pulse-slow">
          Routing you to your dashboard...
        </p>
      </div>
    </div>
  );
}
