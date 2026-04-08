"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function PeriodToggle() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get("period") || "annual";
  const fund = searchParams.get("fund") || "REGULAR";

  const periods = [
    { id: "annual", label: "Annually" },
    { id: "q1", label: "Q1" },
    { id: "q2", label: "Q2" },
    { id: "q3", label: "Q3" },
    { id: "q4", label: "Q4" },
  ];

  return (
    <div className="flex gap-2 bg-slate-100 p-1 rounded-xl overflow-x-auto w-full md:w-auto">
      {periods.map((p) => {
        const isActive = currentPeriod === p.id;
        return (
          <Link
            key={p.id}
            href={`${pathname}?fund=${fund}&period=${p.id}`}
            className={`flex-1 min-w-[80px] md:flex-none md:px-4 rounded-lg py-2 text-center text-sm font-semibold transition-all duration-300 ${
              isActive 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {p.label}
          </Link>
        );
      })}
    </div>
  );
}
