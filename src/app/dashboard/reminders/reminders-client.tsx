"use client";

import { Category, Reminder } from "@prisma/client";
import { addReminder, completeReminder, deleteReminder } from "./actions";
import { useRef, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Modal } from "../modal";


type ReminderWithCategory = Reminder & {
  category?: Category | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Reminder
        </>
      )}
    </button>
  );
}

export function RemindersClient({ 
  categories, 
  initialReminders,
  initialHistory
}: { 
  categories: Category[], 
  initialReminders: ReminderWithCategory[],
  initialHistory: ReminderWithCategory[]
}) {
  const ref = useRef<HTMLFormElement>(null);
  const [reminders, setReminders] = useState(initialReminders);
  const [history, setHistory] = useState(initialHistory);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [deletingReminderId, setDeletingReminderId] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  useEffect(() => {
    // Update current time every 10 seconds to check for due reminders
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Use a state trick to force re-render with fresh initialReminders from server
  // when Next.js router re-fetches the page.
  if (initialReminders !== reminders || initialHistory !== history) {
    setReminders(initialReminders);
    setHistory(initialHistory);
  }

  const handleAdd = async (formData: FormData) => {
    const res = await addReminder(formData);
    if (res?.error) {
      setErrorModal(res.error);
    } else {
      ref.current?.reset();
    }
  };

  const handleComplete = async (id: string) => {
    // Optimistic update
    const completed = reminders.find(r => r.id === id);
    if (completed) {
      setReminders(prev => prev.filter(r => r.id !== id));
      setHistory(prev => [{ ...completed, isCompleted: true }, ...prev]);
    }
    await completeReminder(id);
  };

  const handleDelete = async (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    setHistory(prev => prev.filter(r => r.id !== id));
    await deleteReminder(id);
    setDeletingReminderId(null);
  };

  const quickSuggestions = [
    "Review weekly spending",
    "Check budget status",
    "Plan next month's budget",
    "Reconcile transactions",
  ];

  const handleSuggestionClick = (suggestion: string) => {
    if (ref.current) {
      const textarea = ref.current.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
      if (textarea) {
        textarea.value = suggestion;
      }
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      
      {/* Left Column: Form */}
      <div className="lg:col-span-1 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Add New Reminder</h2>
          
          <form ref={ref} action={handleAdd} className="space-y-4">
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                Reminder Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={3}
                placeholder="e.g., Review monthly expenses"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm resize-none"
              />
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-slate-700 mb-1">
                Transaction Type (Optional)
              </label>
              <select
                id="categoryId"
                name="categoryId"
                defaultValue=""
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-slate-700 mb-1">
                Time
              </label>
              <input
                type="time"
                id="time"
                name="time"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              />
            </div>

            <div className="pt-2">
              <SubmitButton />
            </div>
          </form>

          {/* Quick Suggestions */}
          <div className="mt-6 rounded-xl bg-blue-50 p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Quick Suggestions</h3>
            <ul className="space-y-2">
              {quickSuggestions.map((suggestion, idx) => (
                <li key={idx}>
                  <button 
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs text-blue-700 hover:text-blue-900 transition-colors flex items-center gap-1.5 before:content-['•'] before:text-blue-500 text-left"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right Column: Active Reminders & History */}
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm min-h-[400px]">
          
          {/* Tabs */}
          <div className="flex space-x-4 border-b border-slate-100 mb-6">
            <button
              onClick={() => setActiveTab("active")}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "active"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                Active Reminders
                <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold ${
                  activeTab === "active" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                }`}>
                  {reminders.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "history"
                  ? "border-slate-800 text-slate-800"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                History
                <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold ${
                  activeTab === "history" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {history.length}
                </span>
              </div>
            </button>
          </div>

          {activeTab === "active" ? (
            <>
              {reminders.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {reminders.map((r) => {
                let isDue = false;
                const rDate = new Date(r.date);
                if (r.time) {
                  const [h, m] = r.time.split(':').map(Number);
                  rDate.setHours(h, m, 0, 0);
                } else {
                  rDate.setHours(23, 59, 59, 999);
                }
                isDue = currentTime >= rDate;

                return (
                  <div 
                    key={r.id} 
                    className={`group relative flex flex-col justify-between rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${
                      isDue 
                        ? "border-red-300 bg-red-50/50" 
                        : "border-slate-200 hover:border-blue-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col">
                          <p className={`font-medium ${isDue ? "text-red-900" : "text-slate-900"}`}>
                            {r.message}
                          </p>
                          {isDue && (
                            <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600 animate-pulse">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Due Now
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button 
                            onClick={() => handleComplete(r.id)}
                            className="p-1.5 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Mark as done"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => setDeletingReminderId(r.id)}
                            className="p-1.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete reminder"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {r.category && (
                        <span className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${isDue ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>
                          {r.category.name}
                        </span>
                      )}
                    </div>

                    <div className={`mt-4 flex items-center gap-2 text-xs ${isDue ? "text-red-500 font-semibold" : "text-slate-500"}`}>
                      <svg className={`h-4 w-4 shrink-0 ${isDue ? "text-red-500" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      <span>
                        {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {r.time && ` at ${r.time}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-[300px] flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-slate-50 p-4">
                <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-600">No active reminders</p>
              <p className="mt-1 text-xs text-slate-400">Create a reminder to stay on top of your budget</p>
            </div>
          )}
        </>
      ) : (
        <>
          {history.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {history.map((r) => (
                <div 
                  key={r.id} 
                  className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition-all"
                >
                  <div className="opacity-70">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col">
                        <p className="font-medium text-slate-700 line-through">
                          {r.message}
                        </p>
                        <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Completed
                        </span>
                      </div>
                      
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button 
                          onClick={() => setDeletingReminderId(r.id)}
                          className="p-1.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete reminder"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {r.category && (
                      <span className="mt-2 inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-500">
                        {r.category.name}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 opacity-70">
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    <span>
                      {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {r.time && ` at ${r.time}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[300px] flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-slate-50 p-4">
                <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-600">No reminder history</p>
              <p className="mt-1 text-xs text-slate-400">Completed reminders will appear here</p>
            </div>
          )}
        </>
      )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingReminderId}
        onClose={() => setDeletingReminderId(null)}
        title="Delete Reminder"
        maxWidth="md"
        minHeight={false}
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold leading-6 text-slate-900">Delete reminder</h3>
              <p className="text-sm text-slate-500 mt-1">
                Are you sure you want to delete this reminder? This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-3 sm:flex-row-reverse">
            <button
              type="button"
              onClick={() => {
                if (deletingReminderId) {
                  handleDelete(deletingReminderId);
                }
              }}
              className="inline-flex w-full justify-center rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto transition-colors"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setDeletingReminderId(null)}
              className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!errorModal} onClose={() => setErrorModal(null)} title="Reminder Failed" maxWidth="md" minHeight={false}>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold leading-6 text-slate-900">Unable to add reminder</h3>
              <p className="text-sm text-slate-500 mt-1">{errorModal}</p>
            </div>
          </div>
          <div className="flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={() => setErrorModal(null)}
              className="inline-flex w-full justify-center rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
