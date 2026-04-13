"use client";

import { Category } from "@prisma/client";
import { deleteTransaction } from "./actions";
import { EditTransactionForm } from "./edit-transaction-form";
import { SuccessModal } from "../ui/success-modal";
import { Modal } from "../modal";
import { useState } from "react";

type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  categoryId?: string;
  categoryName: string;
  categoryColor: string;
  particulars?: string;
  type: string;
};

const tailwindToHex: Record<string, string> = {
  "bg-blue-500": "#3b82f6",
  "bg-emerald-500": "#10b981",
  "bg-amber-500": "#f59e0b",
  "bg-amber-400": "#fbbf24",
  "bg-blue-400": "#60a5fa",
  "bg-red-500": "#ef4444",
  "bg-purple-500": "#a855f7",
  "bg-pink-500": "#ec4899",
  "bg-slate-500": "#64748b",
  "bg-indigo-500": "#6366f1",
  "bg-cyan-500": "#06b6d4",
  "bg-teal-500": "#14b8a6",
  "bg-orange-500": "#f97316",
  "bg-rose-500": "#f43f5e",
  "bg-fuchsia-500": "#d946ef",
};

export function TransactionList({
  transactions,
  categories,
  accentColor,
  periodKey = "annual",
}: {
  transactions: Transaction[];
  categories: Category[];
  accentColor: string;
  periodKey?: string;
}) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showAllModal, setShowAllModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionToCopy, setTransactionToCopy] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [filterQuarter, setFilterQuarter] = useState<string>(periodKey !== "annual" ? periodKey : "all");
  const itemsPerPage = 5;

  const filteredTransactions = transactions.filter(t => {
    if (periodKey !== "annual") return true; // If already on a quarter view, show all passed transactions (which are already filtered by that quarter)
    if (filterQuarter === "all") return true;
    
    const date = new Date(t.date);
    const month = date.getMonth(); // 0-11
    
    if (filterQuarter === "q1") return month >= 0 && month <= 2;
    if (filterQuarter === "q2") return month >= 3 && month <= 5;
    if (filterQuarter === "q3") return month >= 6 && month <= 8;
    if (filterQuarter === "q4") return month >= 9 && month <= 11;
    
    return true;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isCobf = accentColor === "emerald";
  const themeText = isCobf ? "text-emerald-600" : "text-blue-600";

  const handleCopy = (t: Transaction) => {
    setTransactionToCopy(t);
  };

  const confirmCopy = () => {
    if (transactionToCopy) {
      const event = new CustomEvent("copy-transaction", { detail: transactionToCopy });
      window.dispatchEvent(event);
      setTransactionToCopy(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg className="h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
        <p className="text-sm font-medium text-slate-600">No transactions yet</p>
        <p className="text-xs text-slate-400 mt-1">Add your first transaction to get started</p>
      </div>
    );
  }

  return (
    <>
      {/* Hidden button to allow external triggering of the "See All" modal */}
      <button 
        data-transaction-list-trigger="true" 
        className="hidden" 
        onClick={() => setShowAllModal(true)} 
        aria-hidden="true"
      />

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {transactions.slice(0, 3).map((t) => {
          const colorHex = tailwindToHex[t.categoryColor] || tailwindToHex["bg-slate-500"];

          return (
            <div 
              key={t.id} 
              onClick={() => handleCopy(t)}
              className="group relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-sm cursor-pointer"
            >
              {/* Left accent border */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 opacity-0 group-hover:opacity-100"
                style={{ backgroundColor: colorHex }}
              />
              
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">{t.description}</p>
                  {t.particulars && (
                    <p className="text-xs text-slate-500 mt-0.5">{t.particulars}</p>
                  )}
                  <div className="flex items-center flex-wrap gap-2 mt-2">
                    <span 
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase leading-tight max-w-full"
                      style={{ backgroundColor: `${colorHex}15`, color: colorHex }}
                    >
                      <span className="line-clamp-2 text-left">{t.categoryName}</span>
                    </span>
                    <span className="text-xs font-medium text-slate-400 shrink-0">
                      • {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-sm font-bold ${t.type === "EXPENSE" ? "text-slate-900" : themeText}`}>
                    {t.type === "EXPENSE" ? "-" : "+"}{formatCurrency(t.amount)}
                  </span>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTransaction(t);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit transaction"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        setTransactionToDelete(t);
                      }}
                      disabled={isDeleting === t.id}
                      className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Delete transaction"
                    >
                      {isDeleting === t.id ? (
                        <svg className="animate-spin w-4 h-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingTransaction && (
        <Modal
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          title="Edit Transaction"
        >
          <EditTransactionForm
            transaction={editingTransaction}
            categories={categories}
            accentColor={accentColor}
            onCancel={() => setEditingTransaction(null)}
            onSuccess={() => {
              setEditingTransaction(null);
              setSuccessMessage("Transaction has been successfully updated.");
              setShowSuccess(true);
              setTimeout(() => setShowSuccess(false), 2000);
            }}
          />
        </Modal>
      )}

      <SuccessModal
        isOpen={showSuccess}
        title="Success"
        message={successMessage}
      />

      <Modal
        isOpen={showAllModal}
        onClose={() => {
          setShowAllModal(false);
          setCurrentPage(1);
          setFilterQuarter(periodKey !== "annual" ? periodKey : "all");
        }}
        title={periodKey === "annual" ? "All Transactions" : `All Transactions for ${periodKey.toUpperCase()}`}
        headerRight={
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mt-2 sm:mt-0 w-full sm:w-auto">
            {periodKey === "annual" && (
              <select
                value={filterQuarter}
                onChange={(e) => {
                  setFilterQuarter(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full sm:w-auto rounded-lg border-0 py-1.5 pl-3 pr-8 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-emerald-600 sm:text-sm sm:leading-6 bg-white"
              >
                <option value="all">All Quarters</option>
                <option value="q1">Q1 (Jan-Mar)</option>
                <option value="q2">Q2 (Apr-Jun)</option>
                <option value="q3">Q3 (Jul-Sep)</option>
                <option value="q4">Q4 (Oct-Dec)</option>
              </select>
            )}

            {filteredTransactions && filteredTransactions.length > 0 ? (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm shrink-0">
                <span className="text-sm font-semibold">Total:</span>
                <span className="text-base font-bold">
                  {formatCurrency(filteredTransactions.reduce((sum, t) => sum + t.amount, 0))}
                </span>
              </div>
            ) : null}
          </div>
        }
      >
        <div className="h-full w-full flex flex-col pr-2 pb-4">
          <div className="space-y-3 flex-1 overflow-y-auto min-h-[300px]">
            {filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                <svg className="h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
                <p className="text-sm font-medium text-slate-600">No transactions found</p>
                <p className="text-xs text-slate-400 mt-1">Try changing the quarter filter</p>
              </div>
            ) : (
              filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((t) => {
                const colorHex = tailwindToHex[t.categoryColor] || tailwindToHex["bg-slate-500"];
                const totalAmount = filteredTransactions.reduce((sum, tr) => sum + tr.amount, 0);
                const percent = totalAmount > 0 ? ((t.amount / totalAmount) * 100).toFixed(1) : "0";

                return (
                <div 
                  key={t.id} 
                  onClick={() => {
                    setShowAllModal(false);
                    handleCopy(t);
                  }}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
                >
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 opacity-70 group-hover:opacity-100 group-hover:w-2"
                    style={{ backgroundColor: colorHex }}
                  />
                  <div className="flex items-center gap-4 pl-2">
                    <div 
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-sm transition-transform group-hover:scale-105"
                      style={{ backgroundColor: `${colorHex}15`, color: colorHex }}
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-slate-700 transition-colors">{t.description}</p>
                      {t.particulars && <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 mb-1">{t.particulars}</p>}
                      <div className="flex items-center flex-wrap gap-2 mt-1">
                        <span 
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase leading-tight max-w-[200px] sm:max-w-full"
                          style={{ backgroundColor: `${colorHex}15`, color: colorHex }}
                        >
                          <span className="line-clamp-2 text-left">{t.categoryName}</span>
                        </span>
                        <span className="text-xs font-medium text-slate-400 shrink-0">
                          • {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-slate-900 text-base">
                        {t.type === "EXPENSE" ? "-" : "+"}{formatCurrency(t.amount)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-medium text-slate-500">{percent}%</span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${isCobf ? 'text-emerald-500' : 'text-blue-500'}`}>
                          {isCobf ? 'COBF' : 'Regular'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAllModal(false);
                          setEditingTransaction(t);
                        }}
                        className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit transaction"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          setTransactionToDelete(t);
                        }}
                        disabled={isDeleting === t.id}
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Delete transaction"
                      >
                        {isDeleting === t.id ? (
                          <svg className="animate-spin w-4 h-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
              })
            )}
          </div>

          {/* Pagination Controls */}
          {filteredTransactions.length > itemsPerPage && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
              <p className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-slate-900">{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> of <span className="font-medium text-slate-900">{filteredTransactions.length}</span> results
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredTransactions.length / itemsPerPage), p + 1))}
                  disabled={currentPage >= Math.ceil(filteredTransactions.length / itemsPerPage)}
                  className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Copy Confirmation Modal */}
      <Modal
        isOpen={!!transactionToCopy}
        onClose={() => setTransactionToCopy(null)}
        title="Copy Transaction"
        maxWidth="md"
        minHeight={false}
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold leading-6 text-slate-900">Copy transaction details?</h3>
              <p className="text-sm text-slate-500 mt-1">
                This will automatically fill the "Add Transaction" form with this transaction's details.
              </p>
            </div>
          </div>
          <div className="flex gap-3 sm:flex-row-reverse">
            <button
              type="button"
              onClick={confirmCopy}
              className="inline-flex w-full justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto transition-colors"
            >
              Copy Details
            </button>
            <button
              type="button"
              onClick={() => setTransactionToCopy(null)}
              className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!transactionToDelete}
        onClose={() => setTransactionToDelete(null)}
        title="Delete Transaction"
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
              <h3 className="text-base font-semibold leading-6 text-slate-900">Delete transaction</h3>
              <p className="text-sm text-slate-500 mt-1">
                Are you sure you want to delete this transaction? This action cannot be undone and will update your budget totals.
              </p>
            </div>
          </div>
          <div className="flex gap-3 sm:flex-row-reverse">
            <button
              type="button"
              onClick={async () => {
                if (transactionToDelete) {
                  setIsDeleting(transactionToDelete.id);
                  const res = await deleteTransaction(transactionToDelete.id);
                  setIsDeleting(null);
                  if (res?.success) {
                    setTransactionToDelete(null);
                    setShowAllModal(false);
                    setSuccessMessage("Transaction has been successfully deleted.");
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 2000);
                  }
                }
              }}
              className="inline-flex w-full justify-center rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto transition-colors"
            >
              {isDeleting === transactionToDelete?.id ? "Deleting..." : "Delete"}
            </button>
            <button
              type="button"
              onClick={() => setTransactionToDelete(null)}
              className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}