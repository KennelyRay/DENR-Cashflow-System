"use client";

import { Category, FundType } from "@prisma/client";
import { addTransaction } from "./actions";
import { useRef, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { SuccessModal } from "../ui/success-modal";
import { Modal } from "../modal";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

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
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Submit Transaction
        </>
      )}
    </button>
  );
}

export function TransactionForm({ categories, fundType }: { categories: Category[], fundType: FundType }) {
  const ref = useRef<HTMLFormElement>(null);
  const [amountDisplay, setAmountDisplay] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const accentColor = fundType === "COBF" ? "amber" : "blue";
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [errorModal, setErrorModal] = useState<string | null>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Basic currency formatting as user types
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

  useEffect(() => {
    const handleCopy = (e: Event) => {
      const customEvent = e as CustomEvent;
      const t = customEvent.detail;
      
      if (ref.current) {
        const dateInput = ref.current.elements.namedItem("date") as HTMLInputElement;
        const categorySelect = ref.current.elements.namedItem("categoryId") as HTMLSelectElement;
        const nameInput = ref.current.elements.namedItem("name") as HTMLInputElement;
        const particularsInput = ref.current.elements.namedItem("particulars") as HTMLTextAreaElement;
        
        if (dateInput) dateInput.value = new Date(t.date).toISOString().split('T')[0];
        if (categorySelect) categorySelect.value = t.categoryId || "";
        if (nameInput) nameInput.value = t.description;
        if (particularsInput) particularsInput.value = t.particulars || "";
        
        const formattedAmount = Number(t.amount).toLocaleString("en-PH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        setAmountDisplay(formattedAmount);
        
        // Highlight form to show it copied successfully
        ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
        
        // Optional visual flash
        ref.current.classList.add("ring-2", "ring-emerald-500", "ring-offset-2", "transition-all", "duration-500");
        setTimeout(() => {
          ref.current?.classList.remove("ring-2", "ring-emerald-500", "ring-offset-2", "transition-all", "duration-500");
        }, 1000);
      }
    };

    window.addEventListener("copy-transaction", handleCopy);
    return () => window.removeEventListener("copy-transaction", handleCopy);
  }, []);

  return (
    <>
    <form
      ref={ref}
      action={async (formData) => {
        // add actual fundType dynamically
        formData.append("fundType", fundType);
        
        // ensure amount is formatted correctly to send to server
        if (amountDisplay) {
          formData.set("amount", amountDisplay);
        }

        const dateStr = formData.get("date") as string;
        let targetQuarter = "";
        if (dateStr) {
          const month = new Date(dateStr).getMonth();
          if (month >= 0 && month <= 2) targetQuarter = "q1";
          else if (month >= 3 && month <= 5) targetQuarter = "q2";
          else if (month >= 6 && month <= 8) targetQuarter = "q3";
          else if (month >= 9) targetQuarter = "q4";
        }

        const res = await addTransaction(formData);
        if (res?.success) {
          ref.current?.reset();
          setAmountDisplay("");
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
          
          // Switch view if we are not on annual view and the transaction is in a different quarter
          const currentPeriod = searchParams.get("period") || "";
          if (targetQuarter && currentPeriod !== "annual" && currentPeriod !== targetQuarter) {
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.set("period", targetQuarter);
            router.push(`${pathname}?${newParams.toString()}`);
          }
        } else {
          setErrorModal(res?.error || "An error occurred");
        }
      }}
      className="space-y-5"
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
            defaultValue={new Date().toISOString().split('T')[0]}
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
            defaultValue=""
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
          placeholder="Enter transaction details"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm resize-none"
        />
      </div>

      <div className="pt-2">
        <SubmitButton accentColor={accentColor} />
      </div>
    </form>
    <SuccessModal 
      isOpen={showSuccess} 
      title="Transaction Added" 
      message="The transaction has been successfully recorded." 
    />

    <Modal isOpen={!!errorModal} onClose={() => setErrorModal(null)} title="Transaction Failed" maxWidth="md" minHeight={false}>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold leading-6 text-slate-900">Unable to add transaction</h3>
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
