export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-emerald-100 dark:border-emerald-950/30 rounded-full" />
        <div className="absolute inset-0 border-4 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold tracking-wide animate-pulse-slow">
        Loading Medico Connect...
      </p>
    </div>
  );
}
