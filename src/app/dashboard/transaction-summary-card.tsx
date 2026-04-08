"use client";

export function TransactionSummaryCard({ 
  transactionCount, 
  themeClasses 
}: { 
  transactionCount: number;
  themeClasses: { bgLight: string; text: string; bg: string; }
}) {
  return (
    <div 
      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-slate-300"
      onClick={() => {
        const chartComponent = document.querySelector('[data-charts-trigger="true"]') as HTMLButtonElement;
        if (chartComponent) chartComponent.click();
      }}
    >
      <div>
        <p className="text-xs font-medium text-slate-500">Transactions</p>
        <p className="mt-1 text-xl font-bold text-slate-900">{transactionCount}</p>
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${themeClasses.bgLight} ${themeClasses.text}`}>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>
  );
}