"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function FundToggle() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentFund = searchParams.get("fund") === "COBF" ? "COBF" : "REGULAR";
  const isCobf = currentFund === "COBF";

  return (
    <div className="relative flex rounded-xl bg-slate-100 p-1 w-full md:w-auto md:min-w-[500px]">
      {/* Animated sliding pill */}
      <div
        className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-lg transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) shadow-sm ${
          isCobf ? "translate-x-full bg-emerald-600" : "translate-x-0 bg-blue-600"
        }`}
      />

      <Link
        href={`${pathname}?fund=REGULAR`}
        className={`relative z-10 flex flex-1 items-center justify-center rounded-lg px-2 sm:px-4 py-2.5 text-center text-sm font-semibold transition-colors duration-300 ${
          !isCobf ? "text-white" : "text-slate-600 hover:text-slate-900"
        }`}
      >
        <span className="whitespace-nowrap">Regular Budget</span>
      </Link>
      <Link
        href={`${pathname}?fund=COBF`}
        className={`relative z-10 flex flex-1 items-center justify-center rounded-lg px-2 sm:px-4 py-2.5 text-center text-sm font-semibold leading-snug transition-colors duration-300 ${
          isCobf ? "text-white" : "text-slate-600 hover:text-slate-900"
        }`}
      >
        <span className="whitespace-nowrap">COBF <span className="hidden sm:inline">(Continuing Budget Fund)</span></span>
      </Link>
    </div>
  );
}
