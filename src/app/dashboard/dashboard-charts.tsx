"use client";

import { PieChart, Pie, Cell, Tooltip as PieTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip, Legend, LineChart, Line, Tooltip as LineTooltip } from "recharts";
import { useState } from "react";
import { Modal } from "./modal";
import { Category } from "@prisma/client";
import { deleteTransaction } from "./budget-management/actions";
import { EditTransactionForm } from "./budget-management/edit-transaction-form";
import { SuccessModal } from "./ui/success-modal";

type CategoryData = {
  name: string;
  amount: number;
  color: string;
};

type DailyData = {
  date: string;
  amount: number;
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

type TransactionData = {
  id: string;
  description: string;
  amount: number;
  date: string;
  categoryId?: string;
  categoryName: string;
  categoryColor: string;
  particulars?: string;
};

export function DashboardCharts({ data, dailyData, trendLabel = "Spending Trend", transactions, accentColor, categories }: { data: CategoryData[], dailyData: DailyData[], trendLabel?: string, transactions: TransactionData[], accentColor: string, categories?: Category[] }) {
  const [activeModal, setActiveModal] = useState<"pie" | "bar" | "line" | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<TransactionData | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const chartData = data.map((d) => ({
    name: d.name,
    value: d.amount,
    fill: tailwindToHex[d.color] || "#64748b",
  }));

  return (
    <>
      {/* Hidden button to allow external triggering of the transaction modal */}
      <button 
        data-charts-trigger="true" 
        className="hidden" 
        onClick={() => setActiveModal("pie")} 
        aria-hidden="true"
      />
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Spending Category - Pie Chart */}
      <div 
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-slate-300"
        onClick={() => setActiveModal("pie")}
      >
        <h2 className="text-lg font-semibold text-slate-900">Spending by Category</h2>
        <p className="mt-1 text-xs text-slate-500">Click to enlarge</p>
        <div className="mt-6 flex h-64 items-center justify-center">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <PieTooltip
                  formatter={(value: any) => formatCurrency(Number(value) || 0)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400">No data available</p>
          )}
        </div>
      </div>

      {/* Category Breakdown - Bar Chart */}
      <div 
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-slate-300"
        onClick={() => setActiveModal("bar")}
      >
        <h2 className="text-lg font-semibold text-slate-900">Category Breakdown</h2>
        <p className="mt-1 text-xs text-slate-500">Click to enlarge</p>
        <div className="mt-6 flex h-64 items-center justify-center">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(value) => value.split(' ')[0]} // Shorten long names
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                  width={60}
                />
                <BarTooltip
                  formatter={(value: any) => formatCurrency(Number(value) || 0)}
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400">No data available</p>
          )}
        </div>
      </div>

      {/* Daily Spending Line Chart */}
      <div 
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-slate-300 lg:col-span-2"
        onClick={() => setActiveModal("line")}
      >
        <h2 className="text-lg font-semibold text-slate-900">{trendLabel}</h2>
        <p className="mt-1 text-xs text-slate-500">Click to enlarge</p>
        <div className="mt-6 flex h-64 items-center justify-center">
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                  width={60}
                />
                <LineTooltip
                  formatter={(value: any) => formatCurrency(Number(value) || 0)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke={tailwindToHex[`bg-${accentColor}-500`] || "#3b82f6"} 
                  strokeWidth={2}
                  dot={{ fill: "#ffffff", stroke: tailwindToHex[`bg-${accentColor}-500`] || "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400">No data available</p>
          )}
        </div>
      </div>
      </div>

      {/* Modals */}
      {editingTransaction && categories && (
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
        isOpen={activeModal === "pie" || activeModal === "bar"}
        onClose={() => {
          setActiveModal(null);
          setCurrentPage(1);
        }}
        title="Transaction List"
        headerRight={
          transactions && transactions.length > 0 ? (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm">
              <span className="text-sm font-semibold">Total:</span>
              <span className="text-base font-bold">
                {formatCurrency(transactions.reduce((sum, t) => sum + t.amount, 0))}
              </span>
            </div>
          ) : null
        }
      >
        <div className="h-full w-full flex flex-col pr-2 pb-4">
          {transactions && transactions.length > 0 ? (
            <>
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto min-h-[300px]">
                {transactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((t) => {
                  const colorHex = tailwindToHex[t.categoryColor as keyof typeof tailwindToHex] || tailwindToHex["bg-slate-500"];
                  const isCobf = accentColor === "emerald";
                const totalAmount = transactions.reduce((sum, tr) => sum + tr.amount, 0);
                const percent = totalAmount > 0 ? ((t.amount / totalAmount) * 100).toFixed(1) : "0";
                
                return (
                  <div 
                    key={t.id} 
                    className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
                  >
                    {/* Left accent border */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 opacity-70 group-hover:opacity-100 group-hover:w-2"
                      style={{ backgroundColor: colorHex }}
                    />
                    
                    <div className="flex items-center gap-3 pl-2">
                      <div 
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-100 shadow-sm transition-transform group-hover:scale-105"
                        style={{ backgroundColor: `${colorHex}15`, color: colorHex }} // 15 is hex for ~8% opacity
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-slate-700 transition-colors">{t.description}</p>
                        {t.particulars && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{t.particulars}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span 
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
                            style={{ backgroundColor: `${colorHex}15`, color: colorHex }}
                          >
                            {t.categoryName}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400">
                            • {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-slate-900 text-base">
                          -{formatCurrency(t.amount)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-medium text-slate-500">{percent}%</span>
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${isCobf ? 'text-emerald-500' : 'text-blue-500'}`}>
                            {isCobf ? 'COBF' : 'Regular'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditingTransaction(t)}
                          className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit transaction"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button 
                          onClick={async () => {
                            if (confirm("Are you sure you want to delete this transaction?")) {
                              setIsDeleting(t.id);
                              const res = await deleteTransaction(t.id);
                              setIsDeleting(null);
                              if (res?.success) {
                                setSuccessMessage("Transaction has been successfully deleted.");
                                setShowSuccess(true);
                                setTimeout(() => setShowSuccess(false), 2000);
                              }
                            }
                          }}
                          disabled={isDeleting === t.id}
                          className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Delete transaction"
                        >
                          {isDeleting === t.id ? (
                            <svg className="animate-spin w-3.5 h-3.5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
              
              {/* Pagination Controls */}
              {transactions.length > itemsPerPage && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                  <p className="text-sm text-slate-500">
                    Showing <span className="font-medium text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-slate-900">{Math.min(currentPage * itemsPerPage, transactions.length)}</span> of <span className="font-medium text-slate-900">{transactions.length}</span> results
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
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil(transactions.length / itemsPerPage), p + 1))}
                      disabled={currentPage >= Math.ceil(transactions.length / itemsPerPage)}
                      className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full min-h-[50vh] flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-white p-4 shadow-sm border border-slate-100">
                <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="text-base font-semibold text-slate-700">No transactions available</p>
              <p className="mt-1 text-sm text-slate-500">Transactions will appear here once added.</p>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === "line"}
        onClose={() => setActiveModal(null)}
        title={trendLabel}
      >
        <div className="h-[500px] w-full flex items-center justify-center p-4">
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#475569' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#475569' }}
                  tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                  width={80}
                />
                <LineTooltip
                  formatter={(value: any) => formatCurrency(Number(value) || 0)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke={tailwindToHex[`bg-${accentColor}-500`] || "#3b82f6"} 
                  strokeWidth={3}
                  dot={{ fill: "#ffffff", stroke: tailwindToHex[`bg-${accentColor}-500`] || "#3b82f6", strokeWidth: 3, r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400">No data available</p>
          )}
        </div>
      </Modal>
    </>
  );
}
