"use client";

import { Category } from "@prisma/client";
import { updateTransaction } from "./actions";
import { useState } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton({ accentColor }: { accentColor: string }) {
  const { pending } = useFormStatus();

  const colorClasses =
    accentColor === "amber"
      ? "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500"
      : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full flex items-center justify-center gap-2 rounded-lg ${colorClasses} px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {pending ? (
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Save Changes
        </>
      )}
    </button>
  );
}

export function EditTransactionForm({ 
  transaction, 
  categories, 
  accentColor,
  onSuccess,
  onCancel
}: { 
  transaction: {
    id: string;
    amount: number;
    date: string;
    categoryId?: string;
    description: string;
    particulars?: string;
  }; 
  categories: Category[]; 
  accentColor: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const initialAmount = (transaction.amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const [amountDisplay, setAmountDisplay] = useState(initialAmount);
  const [dateStr] = useState(new Date(transaction.date).toISOString().split('T')[0]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value) {
      value = (parseInt(value, 10) / 100).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      setAmountDisplay(value);
    } else {
      setAmountDisplay("");
    }
  };

  return (
    <form
      action={async (formData) => {
        if (amountDisplay) {
          formData.set("amount", amountDisplay);
        }
        
        const res = await updateTransaction(transaction.id, formData);
        if (res?.success) {
          onSuccess();
        } else {
          alert(res?.error || "An error occurred");
        }
      }}
      className="space-y-5 w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            required
            defaultValue={dateStr}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-slate-700 mb-1">
            Transaction Type
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={transaction.categoryId || ""}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
          >
            <option value="" disabled>Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">
            Amount
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-slate-500 sm:text-sm">₱</span>
            </div>
            <input
              type="text"
              id="amountDisplay"
              value={amountDisplay}
              onChange={handleAmountChange}
              required
              placeholder="0.00"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-7 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={transaction.description}
            placeholder="Enter name"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="particulars" className="block text-sm font-medium text-slate-700 mb-1">
          Particulars
        </label>
        <textarea
          id="particulars"
          name="particulars"
          rows={3}
          defaultValue={transaction.particulars || ""}
          placeholder="Enter transaction details"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm resize-none"
        />
      </div>

      <div className="pt-2 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-white border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <SubmitButton accentColor={accentColor} />
      </div>
    </form>
  );
}