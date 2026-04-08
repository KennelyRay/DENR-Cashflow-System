"use client";

import { useEffect, useState } from "react";

type Reminder = {
  id: string;
  message: string;
  date: Date;
  time: string | null;
};

export function ReminderNotification({ reminders }: { reminders: Reminder[] }) {
  const [activeNotification, setActiveNotification] = useState<Reminder | null>(null);

  useEffect(() => {
    // Check every 10 seconds if any reminder is exactly <= 5 minutes away
    const checkReminders = () => {
      const now = new Date();
      
      const upcoming = reminders.find((r) => {
        const rDate = new Date(r.date);
        if (r.time) {
          const [h, m] = r.time.split(':').map(Number);
          rDate.setHours(h, m, 0, 0);
        } else {
          // If no time is set, it's an all-day event, we don't notify exactly 5 mins before midnight
          return false;
        }

        const diffMs = rDate.getTime() - now.getTime();
        const diffMinutes = diffMs / (1000 * 60);

        // Trigger if it's within the next 5 minutes, but hasn't passed yet
        return diffMinutes > 0 && diffMinutes <= 5;
      });

      if (upcoming) {
        setActiveNotification(upcoming);
      } else {
        setActiveNotification(null);
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 10000);

    return () => clearInterval(interval);
  }, [reminders]);

  if (!activeNotification) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm animate-fade-in-up">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <svg className="h-6 w-6 text-amber-600 animate-pulse" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </div>
        <div className="flex-1 pt-1">
          <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider">Upcoming Reminder</h3>
          <p className="mt-1 text-base font-semibold text-amber-800">{activeNotification.message}</p>
          <p className="mt-0.5 text-sm font-medium text-amber-700">Due in less than 5 minutes ({activeNotification.time})</p>
        </div>
        <button 
          onClick={() => setActiveNotification(null)}
          className="text-amber-500 hover:text-amber-700 transition-colors p-1"
          title="Dismiss"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
