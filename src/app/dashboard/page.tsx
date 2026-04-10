import { prisma } from "@/lib/prisma";
import { FundType, TransactionType } from "@prisma/client";
import { FundToggle } from "./fund-toggle";
import { PeriodToggle } from "./period-toggle";

import { DashboardCharts } from "./dashboard-charts";
import { EditableBudgetCard } from "./budget-management/editable-budget-card";
import { TransactionSummaryCard } from "./transaction-summary-card";
import { ReminderNotification } from "./reminder-notification";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const activeProfileId = (await cookies()).get("denr_active_profile")?.value;
  
  if (!activeProfileId) {
    redirect("/dashboard/profiles");
  }

  const activeProfile = await prisma.budgetProfile.findUnique({
    where: { id: activeProfileId }
  });

  const searchParams = await props.searchParams;
  const fundQuery = searchParams?.fund as string;
  const currentFund = fundQuery === "COBF" ? FundType.COBF : FundType.REGULAR;
  const currentYear = new Date().getFullYear();

  // Calculate current quarter dynamically
  const currentMonth = new Date().getMonth();
  let defaultQuarter = "q1";
  if (currentMonth >= 3 && currentMonth <= 5) defaultQuarter = "q2";
  else if (currentMonth >= 6 && currentMonth <= 8) defaultQuarter = "q3";
  else if (currentMonth >= 9) defaultQuarter = "q4";

  const periodQuery = searchParams?.period as string || defaultQuarter;

  let startDate = new Date(currentYear, 0, 1);
  let endDate = new Date(currentYear + 1, 0, 1);

  if (periodQuery === "q1") {
    endDate = new Date(currentYear, 3, 1);
  } else if (periodQuery === "q2") {
    startDate = new Date(currentYear, 3, 1);
    endDate = new Date(currentYear, 6, 1);
  } else if (periodQuery === "q3") {
    startDate = new Date(currentYear, 6, 1);
    endDate = new Date(currentYear, 9, 1);
  } else if (periodQuery === "q4") {
    startDate = new Date(currentYear, 9, 1);
    endDate = new Date(currentYear + 1, 0, 1);
  }

  const budget = await prisma.budget.findUnique({
    where: {
      profileId_fundType_year: {
        profileId: activeProfileId,
        fundType: currentFund,
        year: currentYear,
      },
    },
  });

  const isQuarterly = periodQuery !== "annual";
  const fullBudget = budget ? Number(budget.totalAmount) : 0;
  
  let totalAmount = fullBudget;
  if (periodQuery === "q1") totalAmount = budget ? Number(budget.q1Amount) : 0;
  else if (periodQuery === "q2") totalAmount = budget ? Number(budget.q2Amount) : 0;
  else if (periodQuery === "q3") totalAmount = budget ? Number(budget.q3Amount) : 0;
  else if (periodQuery === "q4") totalAmount = budget ? Number(budget.q4Amount) : 0;

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

  const reminders = await prisma.reminder.findMany({
    where: { isCompleted: false },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  });

  const totalSpent = transactions
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const remaining = totalAmount - totalSpent;
  const transactionCount = transactions.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const categorySpending = transactions
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((acc, t) => {
      const catName = t.category?.name || "Uncategorized";
      const catColor = t.category?.color || "bg-slate-500";
      if (!acc[catName]) {
        acc[catName] = { amount: 0, color: catColor };
      }
      acc[catName].amount += Number(t.amount);
      return acc;
    }, {} as Record<string, { amount: number; color: string }>);

  const categoryEntries = Object.entries(categorySpending).sort((a, b) => b[1].amount - a[1].amount);

  let periodData: { date: string; amount: number }[] = [];
  let trendLabel = "Spending Trend";

  if (periodQuery === "annual") {
    trendLabel = "Monthly Spending (Annually)";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlySpending = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => {
        const month = t.date.getMonth();
        if (!acc[month]) acc[month] = 0;
        acc[month] += Number(t.amount);
        return acc;
      }, {} as Record<number, number>);
      
    periodData = months.map((month, i) => ({
      date: month,
      amount: monthlySpending[i] || 0,
    }));
  } else {
    const quarterLabels: Record<string, string> = { q1: "Q1", q2: "Q2", q3: "Q3", q4: "Q4" };
    trendLabel = `Monthly Spending (${quarterLabels[periodQuery] || periodQuery})`;
    const startMonth = startDate.getMonth();
    const months = [0, 1, 2].map(i => {
      const d = new Date(currentYear, startMonth + i, 1);
      return { index: startMonth + i, label: d.toLocaleDateString("en-US", { month: "short" }) };
    });

    const monthlySpending = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => {
        const month = t.date.getMonth();
        if (!acc[month]) acc[month] = 0;
        acc[month] += Number(t.amount);
        return acc;
      }, {} as Record<number, number>);

    periodData = months.map(m => ({
      date: m.label,
      amount: monthlySpending[m.index] || 0,
    }));
  }

  const accentColor = currentFund === "COBF" ? "emerald" : "blue";

  // Pass detailed transactions to charts component
  const detailedTransactions = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .map(t => ({
      id: t.id,
      description: t.description,
      amount: Number(t.amount),
      date: t.date.toISOString(),
      categoryId: t.categoryId || undefined,
      categoryName: t.category?.name || "Uncategorized",
      categoryColor: t.category?.color || "bg-slate-500",
      particulars: t.particulars || undefined,
    }));

  // Map full Tailwind classes to avoid JIT purging issues with dynamic strings
  const themeClasses = {
    bgLight: currentFund === "COBF" ? "bg-emerald-100" : "bg-blue-100",
    text: currentFund === "COBF" ? "text-emerald-600" : "text-blue-600",
    bg: currentFund === "COBF" ? "bg-emerald-500" : "bg-blue-500",
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {activeProfile?.name || "Dashboard"} Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your budget and spending</p>
      </div>

      {/* Fund and Period Toggles */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <FundToggle />
        <PeriodToggle />
      </div>

      <ReminderNotification reminders={reminders} />

      {/* Animated Dashboard Content Wrapper */}
      <div key={currentFund} className="animate-fade-in-up space-y-6">
        {/* Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Regular Budget */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-medium text-slate-500">{periodQuery === "annual" ? "Annual" : periodQuery.toUpperCase()} Budget</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(totalAmount)}</p>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${themeClasses.bgLight} ${themeClasses.text}`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Remaining */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-medium text-slate-500">Remaining</p>
            <p className="mt-1 text-xl font-bold text-emerald-600">{formatCurrency(remaining)}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          </div>
        </div>

        {/* Total Spent */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Spent</p>
            <p className="mt-1 text-xl font-bold text-red-600">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
            </svg>
          </div>
        </div>

        {/* Transactions */}
        <TransactionSummaryCard transactionCount={transactionCount} themeClasses={themeClasses} />
      </div>

      {/* Category Charts */}
      <DashboardCharts 
        data={categoryEntries.map(([name, { amount, color }]) => ({ name, amount, color }))}
        dailyData={periodData}
        trendLabel={trendLabel}
        transactions={detailedTransactions}
        accentColor={accentColor}
        categories={categories}
      />

      {/* Budget Progress */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Budget Progress</h2>
        <div className="mt-6">
          <div className="flex justify-between items-end mb-2">
            <p className="text-sm text-slate-600">Budget Used</p>
            <p className="text-sm font-bold text-slate-900">
              {totalAmount > 0 ? ((totalSpent / totalAmount) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
            <div 
              className={`h-full ${themeClasses.bg} transition-all duration-500`}
              style={{ width: `${Math.min(totalAmount > 0 ? (totalSpent / totalAmount) * 100 : 0, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-xs text-slate-500">₱0</p>
            <p className="text-xs text-slate-500">{formatCurrency(totalAmount)}</p>
          </div>
        </div>

        {periodQuery === "annual" && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-sm font-semibold text-slate-700 mb-4">Quarterly Budget Breakdown</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-medium text-slate-500">Q1</p>
                <p className="mt-1 font-bold text-slate-900">{formatCurrency(budget ? Number(budget.q1Amount) : 0)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-medium text-slate-500">Q2</p>
                <p className="mt-1 font-bold text-slate-900">{formatCurrency(budget ? Number(budget.q2Amount) : 0)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-medium text-slate-500">Q3</p>
                <p className="mt-1 font-bold text-slate-900">{formatCurrency(budget ? Number(budget.q3Amount) : 0)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-medium text-slate-500">Q4</p>
                <p className="mt-1 font-bold text-slate-900">{formatCurrency(budget ? Number(budget.q4Amount) : 0)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

