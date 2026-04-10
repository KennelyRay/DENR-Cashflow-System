"use client";

import { useState } from "react";
import { FundType } from "@prisma/client";
import { updateBudget } from "./actions";
import { SuccessModal } from "../ui/success-modal";
import { Modal } from "../modal";

export function EditableBudgetCard({
  totalAmount,
  remaining,
  totalSpent,
  percentSpent,
  accentColor,
  currentFund,
  periodLabel,
  periodKey,
  q1Amount,
  q2Amount,
  q3Amount,
  q4Amount,
  q1Spent,
  q2Spent,
  q3Spent,
  q4Spent,
  annualTotal,
}: {
  totalAmount: number;
  remaining: number;
  totalSpent: number;
  percentSpent: number;
  accentColor: string;
  currentFund: FundType;
  periodLabel: string;
  periodKey: string;
  q1Amount?: number;
  q2Amount?: number;
  q3Amount?: number;
  q4Amount?: number;
  q1Spent?: number;
  q2Spent?: number;
  q3Spent?: number;
  q4Spent?: number;
  annualTotal?: number;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [errorModal, setErrorModal] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isConsumed = percentSpent >= 100;

  const themeClasses = {
    bgLight: currentFund === "COBF" ? "bg-emerald-100" : "bg-blue-100",
    text: currentFund === "COBF" ? "text-emerald-600" : "text-blue-600",
    bg: isConsumed ? "bg-red-500" : (currentFund === "COBF" ? "bg-emerald-500" : "bg-blue-500"),
    border: currentFund === "COBF" ? "border-emerald-500" : "border-blue-500",
    ring: currentFund === "COBF" ? "focus:ring-emerald-500" : "focus:ring-blue-500",
    btn: currentFund === "COBF" ? "bg-emerald-600" : "bg-blue-600",
    hover: currentFund === "COBF" ? "hover:bg-emerald-700" : "hover:bg-blue-700",
  };

  const handleEditClick = () => {
    setEditValue(totalAmount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }));
    setIsEditing(true);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value) {
      value = (parseInt(value, 10) / 100).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setEditValue(value);
    } else {
      setEditValue("");
    }
  };

  const handleSave = async () => {
    if (!editValue) return;
    setIsSaving(true);
    const res = await updateBudget(currentFund, editValue, periodKey);
    setIsSaving(false);
    if (res?.success) {
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } else {
      setErrorModal(res?.error || "An error occurred while saving the budget.");
    }
  };

  const getQuarterColorClass = (amount: number, spent: number) => {
    if (amount === 0) return "text-slate-900";
    if (spent === 0) return "text-slate-900"; // Full
    
    const remainingBudget = amount - spent;
    const percentRemaining = remainingBudget / amount;
    
    if (percentRemaining >= 0.8) return "text-emerald-600"; // Green
    if (percentRemaining >= 0.4) return "text-yellow-500"; // Yellow
    if (percentRemaining > 0) return "text-orange-500"; // Orange
    return "text-red-600"; // Red (Consumed)
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm relative group">
      {/* Edit Button */}
      {!isEditing && (
        <button
          onClick={handleEditClick}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="Edit Total Budget"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      )}

      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${themeClasses.bgLight} ${themeClasses.text}`}>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{periodLabel} Budget</p>
          {isEditing ? (
            <div className="mt-1 flex items-center gap-2">
              <div className="relative flex-1 max-w-[200px]">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate-500 font-bold">₱</span>
                </div>
                <input
                  type="text"
                  autoFocus
                  value={editValue}
                  onChange={handleAmountChange}
                  className={`w-full rounded-lg border-2 ${themeClasses.border} bg-white py-1.5 pl-8 pr-3 text-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 ${themeClasses.ring} focus:border-transparent`}
                />
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`p-2 rounded-lg ${themeClasses.btn} text-white ${themeClasses.hover} transition-colors disabled:opacity-50`}
              >
                {isSaving ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="p-2 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <p className="text-3xl font-bold text-slate-900">{formatCurrency(totalAmount)}</p>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex justify-between items-end">
          <p className="text-sm text-slate-600">Remaining Budget</p>
          {remaining <= 0 ? (
            <p className="text-sm font-bold text-red-600 uppercase tracking-wide">
              {periodKey === "annual" ? "Annual" : "Quarterly"} Budget Consumed
            </p>
          ) : (
            <p className={`text-xl font-bold ${themeClasses.text}`}>{formatCurrency(remaining)}</p>
          )}
        </div>
        
        {(() => {
          // Calculate the sum of all quarters
          const totalAllocated = (q1Amount || 0) + (q2Amount || 0) + (q3Amount || 0) + (q4Amount || 0);
          
          // Use annualTotal if provided, otherwise fallback to totalAmount (if in annual view)
          const baseAnnual = annualTotal !== undefined ? annualTotal : totalAmount;
          const actualUnallocated = baseAnnual - totalAllocated;
          
          if (actualUnallocated > 0) {
            return (
              <div className="flex justify-between items-end">
                <p className="text-sm text-amber-600">Unallocated Budget</p>
                <p className="text-sm font-semibold text-amber-600">{formatCurrency(actualUnallocated)}</p>
              </div>
            );
          }
          return null;
        })()}

        <div className="flex justify-between items-end">
          <p className="text-sm text-slate-600">Total Spent</p>
          <p className="text-sm font-semibold text-slate-900">{formatCurrency(totalSpent)}</p>
        </div>
        
        <div className="pt-2">
          <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
            <div 
              className={`h-full ${themeClasses.bg} transition-all duration-500`}
              style={{ width: `${Math.min(percentSpent, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-right text-xs text-slate-500">{percentSpent.toFixed(1)}% spent</p>
        </div>
      </div>

      {periodKey === "annual" && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-sm font-semibold text-slate-700 mb-3">Quarterly Breakdown</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-between">
              <p className="text-xs text-slate-500">Q1 Budget</p>
              <div className="mt-1">
                <p className={`font-bold ${getQuarterColorClass(q1Amount || 0, q1Spent || 0)}`}>{formatCurrency((q1Amount || 0) - (q1Spent || 0))}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 border-t border-slate-200 pt-0.5">of {formatCurrency(q1Amount || 0)}</p>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-between">
              <p className="text-xs text-slate-500">Q2 Budget</p>
              <div className="mt-1">
                <p className={`font-bold ${getQuarterColorClass(q2Amount || 0, q2Spent || 0)}`}>{formatCurrency((q2Amount || 0) - (q2Spent || 0))}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 border-t border-slate-200 pt-0.5">of {formatCurrency(q2Amount || 0)}</p>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-between">
              <p className="text-xs text-slate-500">Q3 Budget</p>
              <div className="mt-1">
                <p className={`font-bold ${getQuarterColorClass(q3Amount || 0, q3Spent || 0)}`}>{formatCurrency((q3Amount || 0) - (q3Spent || 0))}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 border-t border-slate-200 pt-0.5">of {formatCurrency(q3Amount || 0)}</p>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-between">
              <p className="text-xs text-slate-500">Q4 Budget</p>
              <div className="mt-1">
                <p className={`font-bold ${getQuarterColorClass(q4Amount || 0, q4Spent || 0)}`}>{formatCurrency((q4Amount || 0) - (q4Spent || 0))}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 border-t border-slate-200 pt-0.5">of {formatCurrency(q4Amount || 0)}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span className="font-semibold text-slate-700">Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-900"></span>
              <span>Full</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
              <span>≥ 80% Left</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500"></span>
              <span>≥ 40% Left</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500"></span>
              <span>&gt; 0% Left</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-600"></span>
              <span>Consumed</span>
            </div>
          </div>
          
          {(() => {
            const totalAllocated = (q1Amount || 0) + (q2Amount || 0) + (q3Amount || 0) + (q4Amount || 0);
            const unallocated = totalAmount - totalAllocated;
            
            if (unallocated > 0) {
              return (
                <div className="mt-4 rounded-lg bg-amber-50 p-4 border border-amber-200 flex items-start gap-3">
                  <svg className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-800">Unallocated Budget</h4>
                    <p className="mt-1 text-sm text-amber-700">
                      You still have <strong>{formatCurrency(unallocated)}</strong> unallocated from your annual budget. Please allocate it to the quarters.
                    </p>
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
    <SuccessModal 
      isOpen={showSuccess} 
      title="Budget Updated" 
      message={`The total budget for ${currentFund} has been updated successfully.`} 
    />

      <Modal isOpen={!!errorModal} onClose={() => setErrorModal(null)} title="Invalid Budget" maxWidth="md" minHeight={false}>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold leading-6 text-slate-900">Unable to save budget</h3>
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
    </>
  );
}