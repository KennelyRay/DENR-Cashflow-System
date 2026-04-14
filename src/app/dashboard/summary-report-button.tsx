"use client";

import { useEffect, useState } from "react";
import { Modal } from "./modal";

type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  categoryName: string;
  particulars?: string;
};

export function SummaryReportButton({
  profileName,
  fundType,
  periodQuery,
  totalBudget,
  totalSpent,
  remaining,
  transactions,
  accentColor
}: {
  profileName: string;
  fundType: string;
  periodQuery: string;
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  transactions: Transaction[];
  accentColor: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const categorized = transactions.reduce((acc, t) => {
    if (!acc[t.categoryName]) {
      acc[t.categoryName] = { amount: 0, items: [] };
    }
    acc[t.categoryName].amount += t.amount;
    acc[t.categoryName].items.push(t);
    return acc;
  }, {} as Record<string, { amount: number; items: Transaction[] }>);

  // Sort categories by amount descending
  const sortedCategories = Object.entries(categorized).sort((a, b) => b[1].amount - a[1].amount);

  const themeBtn = accentColor === "emerald" 
    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 dark:border-emerald-500/20" 
    : "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 dark:border-blue-500/20";

  const [viewMode, setViewMode] = useState<"document" | "electronic">("document");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(max-width: 640px)");
    const onChange = () => setIsMobile(mql.matches);
    onChange();

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!isOpen || !isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen, isMobile]);

  const handleOpen = () => {
    setIsOpen(true);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches) {
      setViewMode("electronic");
    }
  };
  const handleClose = () => setIsOpen(false);

  const isFullscreen = isOpen && isMobile;
  const containerClassName = isFullscreen
    ? `min-h-screen px-4 pt-4 pb-24 ${viewMode === "document" ? "bg-white text-slate-900" : "bg-slate-50"} print:bg-white print:text-slate-900`
    : `p-4 sm:p-8 rounded-lg ${viewMode === "document" ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "bg-slate-50 border-0"} print:shadow-none print:border-0 max-h-[70vh] overflow-y-auto print:max-h-none print:overflow-visible`;

  const reportContent = (
    <div className={containerClassName}>
      <div className={`flex justify-between items-center mb-6 print:hidden border-b border-slate-200 pb-4 ${isFullscreen ? "sticky top-0 bg-white z-10 -mx-4 px-4 pt-2" : ""}`}>
        <div className="flex items-center gap-3">
          {isFullscreen && (
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Back
            </button>
          )}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("document")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === "document" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Print Layout
            </button>
            <button
              onClick={() => setViewMode("electronic")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === "electronic" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Mobile / Digital View
            </button>
          </div>
        </div>

        {viewMode === "document" && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        )}
      </div>

      {viewMode === "document" ? (
        // ================== PRINT DOCUMENT VIEW ==================
        <div>
          {/* Document Header */}
          <div className="text-center mb-6 border-b border-slate-300 pb-4 flex flex-col items-center">
            {/* Added real DENR logo below */}
            <div className="mb-3">
              <img
                src="/denr-logo.png"
                alt="DENR Logo"
                className="w-20 h-20 object-contain"
                onError={(e) => {
                  // Fallback to text if image not found
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.innerHTML =
                    '<div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200"><span class="text-xs font-bold text-slate-500">DENR</span></div>';
                }}
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-widest text-slate-900">Cashflow Summary Report</h1>
            <p className="text-slate-600 mt-1 text-xs sm:text-sm font-medium">
              {profileName} • {fundType === "COBF" ? "Continuing Budget Fund" : "Regular Budget"} • {periodQuery === "annual" ? "Annual" : periodQuery.toUpperCase()}
            </p>
          </div>

          {/* Document Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Total Budget</div>
              <div className="text-base sm:text-lg font-bold text-slate-900">{formatCurrency(totalBudget)}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Total Spent</div>
              <div className="text-base sm:text-lg font-bold text-red-600">{formatCurrency(totalSpent)}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Remaining</div>
              <div className="text-base sm:text-lg font-bold text-emerald-600">{formatCurrency(remaining)}</div>
            </div>
          </div>

          {/* Document Categories Breakdown */}
          {sortedCategories.length === 0 ? (
            <div className="text-center text-slate-500 py-10 italic">
              No transactions found for this period.
            </div>
          ) : (
            <div className="space-y-6">
              {sortedCategories.map(([catName, data]) => (
                <div key={catName} className="break-inside-avoid mb-6">
                  <div className="flex justify-between items-end border-b border-slate-800 pb-1.5 mb-2">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{catName}</h3>
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(data.amount)}</p>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-slate-500">
                        <th className="py-1.5 font-semibold w-[20%]">Date</th>
                        <th className="py-1.5 font-semibold w-[55%]">Description</th>
                        <th className="py-1.5 font-semibold text-right w-[25%]">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map(t => (
                        <tr key={t.id} className="border-b border-slate-100 last:border-0">
                          <td className="py-1.5 text-slate-600 align-top">
                            {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="py-1.5 text-slate-900 align-top">
                            <span className="font-medium">{t.description}</span>
                            {t.particulars && <span className="block text-[10px] text-slate-500 mt-0.5">{t.particulars}</span>}
                          </td>
                          <td className="py-1.5 text-right font-medium text-slate-700 align-top">{formatCurrency(t.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {/* Document Footer */}
          <div className="mt-12 pt-6 border-t border-slate-300 text-center text-xs text-slate-400 print:mt-auto">
            Generated on {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </div>
        </div>
      ) : (
        // ================== ELECTRONIC / MOBILE VIEW ==================
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
            <div className="text-center mb-6 border-b border-slate-200 pb-6 flex flex-col items-center">
              <div className="mb-3">
                <img
                  src="/denr-logo.png"
                  alt="DENR Logo"
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement!.innerHTML =
                      '<div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200"><span class="text-xs font-bold text-slate-500">DENR</span></div>';
                  }}
                />
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold uppercase tracking-widest text-slate-900">Cashflow Summary</h1>
              <p className="text-slate-600 mt-1 text-xs sm:text-sm font-medium">{profileName}</p>
              <p className="text-slate-500 mt-0.5 text-[10px] sm:text-xs">
                {fundType === "COBF" ? "Continuing Budget Fund" : "Regular Budget"} • {periodQuery === "annual" ? "Annual" : periodQuery.toUpperCase()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Total Budget</p>
                <p className="text-sm font-bold text-slate-900">{formatCurrency(totalBudget)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Remaining</p>
                <p className="text-sm font-bold text-emerald-600">{formatCurrency(remaining)}</p>
              </div>
              <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total Spent</p>
                  <p className="text-sm font-bold text-red-600">{formatCurrency(totalSpent)}</p>
                </div>
              </div>
            </div>

            {sortedCategories.length === 0 ? (
              <div className="text-center text-slate-500 py-6 italic border-t border-slate-100">No transactions found.</div>
            ) : (
              <div className="space-y-6 border-t border-slate-100 pt-6">
                {sortedCategories.map(([catName, data]) => (
                  <div key={catName}>
                    <div className="flex justify-between items-end border-b border-slate-300 pb-1.5 mb-2">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">{catName}</h3>
                      <p className="text-xs font-bold text-slate-900">{formatCurrency(data.amount)}</p>
                    </div>

                    <div className="space-y-2">
                      {data.items.map(t => (
                        <div key={t.id} className="flex justify-between items-start gap-2 py-1">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-900 truncate">{t.description}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-400">
                                {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                              </span>
                              {t.particulars && <span className="text-[10px] text-slate-500 truncate">• {t.particulars}</span>}
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 pt-0.5">{formatCurrency(t.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
              Generated electronically on {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <button
        onClick={handleOpen}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border shadow-sm transition-colors ${themeBtn}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Summary Report
      </button>

      {isOpen && isMobile ? (
        <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto">
          {reportContent}
        </div>
      ) : (
        <Modal isOpen={isOpen} onClose={handleClose} title="Summary Report" maxWidth="4xl">
          {reportContent}
        </Modal>
      )}
    </>
  );
}
