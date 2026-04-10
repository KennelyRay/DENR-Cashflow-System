import { Budget } from "@prisma/client";

export type PeriodKey = "annual" | "q1" | "q2" | "q3" | "q4";

export function isValidPeriodKey(key: string): key is PeriodKey {
  return ["annual", "q1", "q2", "q3", "q4"].includes(key);
}

export function getAmountForPeriod(budget: Budget | null, periodKey: string): number {
  if (!budget) return 0;
  const fullBudget = Number(budget.totalAmount);
  
  if (periodKey === "q1") return Number(budget.q1Amount);
  if (periodKey === "q2") return Number(budget.q2Amount);
  if (periodKey === "q3") return Number(budget.q3Amount);
  if (periodKey === "q4") return Number(budget.q4Amount);
  
  return fullBudget;
}

export function getDateRangeForPeriod(year: number, periodKey: string): { startDate: Date; endDate: Date } {
  let startDate = new Date(year, 0, 1);
  let endDate = new Date(year + 1, 0, 1);

  if (periodKey === "q1") {
    endDate = new Date(year, 3, 1);
  } else if (periodKey === "q2") {
    startDate = new Date(year, 3, 1);
    endDate = new Date(year, 6, 1);
  } else if (periodKey === "q3") {
    startDate = new Date(year, 6, 1);
    endDate = new Date(year, 9, 1);
  } else if (periodKey === "q4") {
    startDate = new Date(year, 9, 1);
    endDate = new Date(year + 1, 0, 1);
  }

  return { startDate, endDate };
}
