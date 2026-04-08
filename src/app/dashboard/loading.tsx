export default function Loading() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="rounded-2xl bg-white p-8 shadow-2xl flex flex-col items-center gap-4 border border-slate-100">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute h-full w-full rounded-full border-4 border-emerald-100"></div>
          <div className="absolute h-full w-full rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-lg font-semibold text-slate-800 animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
