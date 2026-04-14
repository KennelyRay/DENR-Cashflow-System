"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "../modal";

const INACTIVITY_MS = 10 * 60 * 1000;
const WARNING_SECONDS = 10;

export default function SessionTimeout() {
  const router = useRouter();
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WARNING_SECONDS);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const warningOpenRef = useRef(false);
  const loggingOutRef = useRef(false);

  const inactivityTimeoutRef = useRef<number | null>(null);
  const logoutTimeoutRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (typeof window === "undefined") return;
    if (inactivityTimeoutRef.current !== null) {
      window.clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }
    if (logoutTimeoutRef.current !== null) {
      window.clearTimeout(logoutTimeoutRef.current);
      logoutTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current !== null) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    if (loggingOutRef.current) return;
    loggingOutRef.current = true;
    setIsLoggingOut(true);
    clearTimers();

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }, [clearTimers, router]);

  const scheduleInactivityTimer = useCallback(() => {
    if (typeof window === "undefined") return;
    clearTimers();
    inactivityTimeoutRef.current = window.setTimeout(() => {
      if (loggingOutRef.current || warningOpenRef.current) return;

      warningOpenRef.current = true;
      setIsWarningOpen(true);
      setSecondsLeft(WARNING_SECONDS);

      countdownIntervalRef.current = window.setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            if (countdownIntervalRef.current !== null) {
              window.clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      logoutTimeoutRef.current = window.setTimeout(() => {
        void handleLogout();
      }, WARNING_SECONDS * 1000);
    }, INACTIVITY_MS);
  }, [clearTimers, handleLogout]);

  const resetSessionTimer = useCallback(() => {
    if (loggingOutRef.current) return;
    warningOpenRef.current = false;
    setIsWarningOpen(false);
    setSecondsLeft(WARNING_SECONDS);
    scheduleInactivityTimer();
  }, [scheduleInactivityTimer]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onActivity = () => resetSessionTimer();

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    for (const event of events) {
      window.addEventListener(event, onActivity, { passive: true });
    }

    scheduleInactivityTimer();

    return () => {
      for (const event of events) {
        window.removeEventListener(event, onActivity);
      }
      clearTimers();
    };
  }, [clearTimers, resetSessionTimer, scheduleInactivityTimer]);

  if (!isWarningOpen) return null;

  return (
    <Modal isOpen={isWarningOpen} onClose={resetSessionTimer} title="Session Timeout" maxWidth="md" minHeight={false}>
      <div className="flex flex-col items-center text-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 border-[6px] border-amber-100">
          <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zM12 15.75h.008v.008H12v-.008z" />
          </svg>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">Are you still there?</h3>
          <p className="text-sm text-slate-600">
            You will be logged out in <span className="font-semibold text-slate-900">{secondsLeft}s</span> due to inactivity.
          </p>
        </div>

        <button
          type="button"
          onClick={resetSessionTimer}
          disabled={isLoggingOut}
          className="w-full sm:w-auto rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-70"
        >
          I&apos;m still here
        </button>

        <div className="text-xs text-slate-400">
          If you don&apos;t interact within {WARNING_SECONDS} seconds, you will be logged out automatically.
        </div>
      </div>
    </Modal>
  );
}
