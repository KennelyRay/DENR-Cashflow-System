"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  async function logout() {
    // Show the modal first and wait a bit for the animation
    setShowModal(true);
    
    // Simulate a small delay for the modal animation to play
    await new Promise((resolve) => setTimeout(resolve, 1500));

    await fetch("/api/auth/logout", { method: "POST" });
    startTransition(() => {
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={logout}
        disabled={isPending || showModal}
        className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-70"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
        </svg>
        {showModal || isPending ? "Logging out..." : "Logout"}
      </button>

      {mounted && showModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Dark Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" />
          
          {/* Modal Card */}
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl animate-fade-in-up border border-slate-100 flex flex-col items-center text-center m-4">
            
            {/* Animated Checkmark Circle */}
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border-[6px] border-emerald-100 animate-bounce-subtle">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-inner">
                <svg className="h-8 w-8 text-white animate-scale-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
              Successfully Logged Out
            </h2>
            <p className="text-slate-500 mb-6">
              Thank you for using DENR Cashflow. Redirecting you safely...
            </p>
            
            {/* Loading Spinner / Progress Indicator */}
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Redirecting...
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

