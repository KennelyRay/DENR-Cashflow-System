import { prisma } from "@/lib/prisma";
import { FundType, TransactionType } from "@prisma/client";
import { FundToggle } from "../fund-toggle";
import { TransactionForm } from "./transaction-form";
import { EditableBudgetCard } from "./editable-budget-card";
import { TransactionList } from "./transaction-list";
import { SeeAllButton } from "./see-all-button";

import { PeriodToggle } from "../period-toggle";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAmountForPeriod, getDateRangeForPeriod, isValidPeriodKey, PeriodKey } from "@/lib/budget-utils";

export default async function BudgetManagementPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const activeProfileId = (await cookies()).get("denr_active_profile")?.value;
  if (!activeProfileId) {
    redirect("/dashboard/profiles");
  }

  const searchParams = await props.searchParams;
  const fundQuery = searchParams?.fund as string;
  const currentFund = fundQuery === "COBF" ? FundType.COBF : FundType.REGULAR;
  const currentYear = new Date().getFullYear();

  // Calculate current quarter dynamically
  const currentMonth = new Date().getMonth();
  let defaultQuarter: PeriodKey = "q1";
  if (currentMonth >= 3 && currentMonth <= 5) defaultQuarter = "q2";
  else if (currentMonth >= 6 && currentMonth <= 8) defaultQuarter = "q3";
  else if (currentMonth >= 9) defaultQuarter = "q4";

  const periodQueryStr = searchParams?.period as string || defaultQuarter;
  const periodQuery: PeriodKey = isValidPeriodKey(periodQueryStr) ? periodQueryStr : defaultQuarter;
  const isQuarterly = periodQuery !== "annual";
  
  const { startDate, endDate } = getDateRangeForPeriod(currentYear, periodQuery);

  const budget = await prisma.budget.findUnique({
    where: {
      profileId_fundType_year: {
        profileId: activeProfileId,
        fundType: currentFund,
        year: currentYear,
      },
    },
  });

  const totalAmount = getAmountForPeriod(budget, periodQuery);

  const transactions = await prisma.transaction.findMany({
    where: {
      profileId: activeProfileId,
      fundType: currentFund,
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
    include: {
      category: true,
    },
    orderBy: [
      { date: 'desc' },
      { createdAt: 'desc' }
    ],
  });

  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc'
    }
  });

  const totalSpent = transactions
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // We need all transactions for the year to calculate quarterly spent amounts
  let allYearTransactions = transactions;
  if (periodQuery !== "annual") {
    allYearTransactions = await prisma.transaction.findMany({
      where: {
        profileId: activeProfileId,
        fundType: currentFund,
        date: {
          gte: new Date(currentYear, 0, 1),
          lt: new Date(currentYear + 1, 0, 1),
        },
        type: TransactionType.EXPENSE,
      },
      include: {
        category: true,
      },
    });
  }

  const q1Spent = allYearTransactions.filter(t => t.type === TransactionType.EXPENSE && t.date.getMonth() >= 0 && t.date.getMonth() <= 2).reduce((sum, t) => sum + Number(t.amount), 0);
  const q2Spent = allYearTransactions.filter(t => t.type === TransactionType.EXPENSE && t.date.getMonth() >= 3 && t.date.getMonth() <= 5).reduce((sum, t) => sum + Number(t.amount), 0);
  const q3Spent = allYearTransactions.filter(t => t.type === TransactionType.EXPENSE && t.date.getMonth() >= 6 && t.date.getMonth() <= 8).reduce((sum, t) => sum + Number(t.amount), 0);
  const q4Spent = allYearTransactions.filter(t => t.type === TransactionType.EXPENSE && t.date.getMonth() >= 9 && t.date.getMonth() <= 11).reduce((sum, t) => sum + Number(t.amount), 0);

  const remaining = totalAmount - totalSpent;
  const percentSpent = totalAmount > 0 ? (totalSpent / totalAmount) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const themeClasses = {
    text: currentFund === "COBF" ? "text-emerald-600" : "text-blue-600",
  };
  const accentColor = currentFund === "COBF" ? "emerald" : "blue";

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Budget Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">Track and manage your transactions</p>
      </div>

      {/* Fund and Period Toggles */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <FundToggle />
        <PeriodToggle />
      </div>

      {/* Animated Dashboard Content Wrapper */}
      <div key={currentFund} className="animate-fade-in-up space-y-6">
        
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Left Column: Budget Overview & Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Total Budget Card */}
            <EditableBudgetCard
              totalAmount={totalAmount}
              remaining={remaining}
              totalSpent={totalSpent}
              percentSpent={percentSpent}
              accentColor={accentColor}
              currentFund={currentFund}
              periodLabel={periodQuery === "annual" ? "Annual" : periodQuery.toUpperCase()}
              periodKey={periodQuery}
              q1Amount={budget ? Number(budget.q1Amount) : 0}
              q2Amount={budget ? Number(budget.q2Amount) : 0}
              q3Amount={budget ? Number(budget.q3Amount) : 0}
              q4Amount={budget ? Number(budget.q4Amount) : 0}
              q1Spent={q1Spent}
              q2Spent={q2Spent}
              q3Spent={q3Spent}
              q4Spent={q4Spent}
              annualTotal={budget ? Number(budget.totalAmount) : 0}
            />

            {/* Add Transaction Form */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Add Transaction</h2>
              <TransactionForm categories={categories} fundType={currentFund} />
            </div>

          </div>

          {/* Right Column: Recent Transactions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-lg font-semibold text-slate-900">Recent Transactions</h2>
              </div>
              <SeeAllButton accentColor={accentColor} />
            </div>

            <TransactionList 
              transactions={transactions.map(t => ({
                id: t.id,
                description: t.description,
                amount: Number(t.amount),
                date: t.date.toISOString(),
                categoryId: t.categoryId || undefined,
                categoryName: t.category?.name || "Uncategorized",
                categoryColor: t.category?.color || "bg-slate-500",
                particulars: t.particulars || undefined,
                type: t.type
              }))}
              categories={categories}
              accentColor={accentColor}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
