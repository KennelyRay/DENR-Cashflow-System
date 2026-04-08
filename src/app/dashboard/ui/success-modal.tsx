"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  message: string;
}

export function SuccessModal({ isOpen, title, message }: SuccessModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
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
          {title}
        </h2>
        <p className="text-slate-500">
          {message}
        </p>
      </div>
    </div>,
    document.body
  );
}
