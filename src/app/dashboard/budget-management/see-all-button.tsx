"use client";

export function SeeAllButton({ accentColor }: { accentColor: string }) {
  const themeText = accentColor === "emerald" ? "text-emerald-600 hover:text-emerald-700" : "text-blue-600 hover:text-blue-700";

  return (
    <button 
      onClick={() => {
        const trigger = document.querySelector('[data-transaction-list-trigger="true"]') as HTMLButtonElement;
        if (trigger) trigger.click();
      }}
      className={`text-sm font-medium ${themeText} hover:underline transition-colors`}
    >
      See all
    </button>
  );
}