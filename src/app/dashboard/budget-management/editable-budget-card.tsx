"use client";

import { useState } from "react";
import { FundType } from "@prisma/client";
import { updateBudget } from "./actions";
import { SuccessModal } from "../ui/success-modal";

export function EditableBudgetCard({
  totalAmount,
  remaining,
  totalSpent,
  percentSpent,
  accentColor,
  currentFund,
  periodLabel,
  periodKey,
}: {
  totalAmount: number;
  remaining: number;
  totalSpent: number;
  percentSpent: number;
  accentColor: string;
  currentFund: FundType;
  periodLabel: string;
  periodKey: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const themeClasses = {
    bgLight: currentFund === "COBF" ? "bg-emerald-100" : "bg-blue-100",
    text: currentFund === "COBF" ? "text-emerald-600" : "text-blue-600",
    bg: currentFund === "COBF" ? "bg-emerald-500" : "bg-blue-500",
    border: currentFund === "COBF" ? "border-emerald-500" : "border-blue-500",
    ring: currentFund === "COBF" ? "focus:ring-emerald-500" : "focus:ring-blue-500",
    btn: currentFund === "COBF" ? "bg-emerald-600" : "bg-blue-600",
    hover: currentFund === "COBF" ? "hover:bg-emerald-700" : "hover:bg-blue-700",
  };

  const handleEditClick = () => {
    setEditValue(totalAmount.toString());
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
      alert(res?.error || "An error occurred while saving the budget.");
    }
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V5.625c0-.621-.504-1.125-1.125-1.125H5.25C4.629 4.5 4.125 5.004 4.125 5.625V9m2.25-2.25h5.25m-5.25 0a2.25 2.25 0 01-2.25-2.25h15a2.25 2.25 0 01-2.25 2.25h-5.25" />
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
          <p className={`text-xl font-bold ${themeClasses.text}`}>{formatCurrency(remaining)}</p>
        </div>
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
    </div>
    <SuccessModal 
      isOpen={showSuccess} 
      title="Budget Updated" 
      message={`The total budget for ${currentFund} has been updated successfully.`} 
    />
    </>
  );
}