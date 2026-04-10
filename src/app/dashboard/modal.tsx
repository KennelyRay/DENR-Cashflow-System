"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  headerRight?: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  minHeight?: boolean;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, headerRight, maxWidth = "5xl", minHeight = true, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, mounted]);

  if (!isOpen || !mounted) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content - Floating over the entire screen */}
      <div className={`relative z-10 w-full ${maxWidthClasses[maxWidth]} rounded-3xl bg-white shadow-2xl animate-fade-in-up m-4 max-h-[90vh] flex flex-col border border-slate-100 overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none print:m-0 print:w-full print:max-w-none`}>
        <div className="flex items-center justify-between px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 bg-slate-50/50 print:hidden">
          <div className="flex items-center gap-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
            {headerRight}
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-2 bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className={`flex-1 overflow-hidden ${minHeight ? 'min-h-[400px]' : ''} p-6 sm:p-8 bg-slate-50/30 print:overflow-visible print:bg-white print:p-0 print:m-0`}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
