"use client";

import { useState } from "react";
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
    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200" 
    : "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200";

  const [viewMode, setViewMode] = useState<"document" | "electronic">("document");

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border shadow-sm transition-colors ${themeBtn}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Summary Report
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Summary Report" maxWidth="4xl">
        <div className={`p-4 sm:p-8 rounded-lg ${viewMode === 'document' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'bg-slate-50 border-0'} print:shadow-none print:border-0 max-h-[70vh] overflow-y-auto print:max-h-none print:overflow-visible`}>
          
          <div className="flex justify-between items-center mb-6 print:hidden border-b border-slate-200 pb-4">
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
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200"><span class="text-xs font-bold text-slate-500">DENR</span></div>';
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
                                {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td className="py-1.5 text-slate-900 align-top">
                                <span className="font-medium">{t.description}</span>
                                {t.particulars && <span className="block text-[10px] text-slate-500 mt-0.5">{t.particulars}</span>}
                              </td>
                              <td className="py-1.5 text-right font-medium text-slate-700 align-top">
                                {formatCurrency(t.amount)}
                              </td>
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
                Generated on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          ) : (
            // ================== ELECTRONIC / MOBILE VIEW ==================
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shrink-0">
                    <img 
                      src="/denr-logo.png" 
                      alt="DENR Logo" 
                      className="w-8 h-8 object-contain"
                      onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{profileName}</h2>
                    <p className="text-sm text-slate-500 font-medium">
                      {fundType === "COBF" ? "Continuing Budget Fund" : "Regular Budget"} • {periodQuery === "annual" ? "Annual" : periodQuery.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 border-t border-slate-100 pt-6">
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Total Budget</p>
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(totalBudget)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Remaining</p>
                    <p className="text-lg font-bold text-emerald-600">{formatCurrency(remaining)}</p>
                  </div>
                  <div className="col-span-2 bg-slate-50 p-3 rounded-xl mt-2">
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-slate-500 font-medium">Total Spent</p>
                      <p className="text-base font-bold text-red-600">{formatCurrency(totalSpent)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {sortedCategories.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200 shadow-sm">
                  No transactions found for this period.
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 px-2 uppercase tracking-wider">Breakdown by Category</h3>
                  
                  {sortedCategories.map(([catName, data]) => (
                    <div key={catName} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                      <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center gap-4">
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-2">{catName}</h4>
                        <span className="font-bold text-slate-900 whitespace-nowrap">{formatCurrency(data.amount)}</span>
                      </div>
                      
                      <div className="divide-y divide-slate-100">
                        {data.items.map(t => (
                          <div key={t.id} className="p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{t.description}</p>
                                {t.particulars && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.particulars}</p>}
                                <p className="text-xs font-medium text-slate-400 mt-2">
                                  {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                              <span className="text-sm font-bold text-slate-700 whitespace-nowrap shrink-0">
                                {formatCurrency(t.amount)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
