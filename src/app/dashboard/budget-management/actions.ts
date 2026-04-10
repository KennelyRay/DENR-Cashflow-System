"use server";

import { prisma } from "@/lib/prisma";
import { FundType, TransactionType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { isValidPeriodKey, PeriodKey } from "@/lib/budget-utils";

export async function addTransaction(formData: FormData) {
  const activeProfileId = (await cookies()).get("denr_active_profile")?.value;
  if (!activeProfileId) return { error: "No active profile selected" };

  const fundType = formData.get("fundType") as FundType;
  const categoryId = formData.get("categoryId") as string;
  const amount = parseFloat((formData.get("amount") as string).replace(/[^0-9.-]+/g, ""));
  const name = formData.get("name") as string;
  const particulars = formData.get("particulars") as string;
  const dateStr = formData.get("date") as string;

  if (!fundType || !categoryId || isNaN(amount) || !name || !dateStr) {
    return { error: "Missing required fields" };
  }

  // Parse the date properly to ensure it stores at midnight UTC
  const parsedDate = new Date(dateStr);
  if (isNaN(parsedDate.getTime())) {
    return { error: "Invalid date format" };
  }

  const currentYear = parsedDate.getFullYear();
  const month = parsedDate.getMonth(); // 0-11
  let targetQuarter = "q1Amount";
  let startDate = new Date(currentYear, 0, 1);
  let endDate = new Date(currentYear, 3, 1);

  if (month >= 3 && month <= 5) {
    targetQuarter = "q2Amount";
    startDate = new Date(currentYear, 3, 1);
    endDate = new Date(currentYear, 6, 1);
  } else if (month >= 6 && month <= 8) {
    targetQuarter = "q3Amount";
    startDate = new Date(currentYear, 6, 1);
    endDate = new Date(currentYear, 9, 1);
  } else if (month >= 9) {
    targetQuarter = "q4Amount";
    startDate = new Date(currentYear, 9, 1);
    endDate = new Date(currentYear + 1, 0, 1);
  }

  try {
    // 1. Get the budget for this fund type and year
    const budget = await prisma.budget.findFirst({
      where: {
        profileId: activeProfileId,
        fundType,
        year: currentYear,
      }
    });

    if (!budget) {
      return { error: `No budget has been set for ${fundType} in ${currentYear}. Please set a budget first.` };
    }

    const quarterBudget = Number(budget[targetQuarter as keyof typeof budget]);
    
    // 2. Get all existing transactions for this quarter to calculate total spent
    const existingTransactions = await prisma.transaction.findMany({
      where: {
        profileId: activeProfileId,
        fundType,
        type: TransactionType.EXPENSE,
        date: {
          gte: startDate,
          lt: endDate,
        }
      }
    });

    const totalSpentSoFar = existingTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

    // 3. Check if the new transaction exceeds the remaining budget
    if (totalSpentSoFar + amount > quarterBudget) {
      const quarterName = targetQuarter.substring(0, 2).toUpperCase();
      const remaining = quarterBudget - totalSpentSoFar;
      return { 
        error: `Insufficient budget. The ${quarterName} budget only has ₱${remaining.toLocaleString('en-PH', {minimumFractionDigits: 2})} remaining, but this transaction is ₱${amount.toLocaleString('en-PH', {minimumFractionDigits: 2})}.` 
      };
    }

    await prisma.transaction.create({
      data: {
        profileId: activeProfileId,
        fundType,
        categoryId,
        amount,
        description: name,
        particulars: particulars || null,
        date: parsedDate,
        type: TransactionType.EXPENSE,
      },
    });

    revalidatePath("/dashboard/budget-management");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error adding transaction:", error);
    return { error: "Failed to add transaction" };
  }
}

export async function updateTransaction(id: string, formData: FormData) {
  const activeProfileId = (await cookies()).get("denr_active_profile")?.value;
  if (!activeProfileId) return { error: "No active profile selected" };

  const categoryId = formData.get("categoryId") as string;
  const amount = parseFloat((formData.get("amount") as string).replace(/[^0-9.-]+/g, ""));
  const name = formData.get("name") as string;
  const particulars = formData.get("particulars") as string;
  const dateStr = formData.get("date") as string;

  if (!id || !categoryId || isNaN(amount) || !name || !dateStr) {
    return { error: "Missing required fields" };
  }

  const parsedDate = new Date(dateStr);
  if (isNaN(parsedDate.getTime())) {
    return { error: "Invalid date format" };
  }

  try {
    // 1. Get the existing transaction to know its fundType and previous amount
    const existingTx = await prisma.transaction.findUnique({
      where: { id }
    });

    if (!existingTx) {
      return { error: "Transaction not found" };
    }

    const currentYear = parsedDate.getFullYear();
    const month = parsedDate.getMonth(); // 0-11
    let targetQuarter = "q1Amount";
    let startDate = new Date(currentYear, 0, 1);
    let endDate = new Date(currentYear, 3, 1);

    if (month >= 3 && month <= 5) {
      targetQuarter = "q2Amount";
      startDate = new Date(currentYear, 3, 1);
      endDate = new Date(currentYear, 6, 1);
    } else if (month >= 6 && month <= 8) {
      targetQuarter = "q3Amount";
      startDate = new Date(currentYear, 6, 1);
      endDate = new Date(currentYear, 9, 1);
    } else if (month >= 9) {
      targetQuarter = "q4Amount";
      startDate = new Date(currentYear, 9, 1);
      endDate = new Date(currentYear + 1, 0, 1);
    }

    // 2. Get the budget for this fund type and year
    const budget = await prisma.budget.findFirst({
      where: {
        profileId: activeProfileId,
        fundType: existingTx.fundType,
        year: currentYear,
      }
    });

    if (!budget) {
      return { error: `No budget has been set for ${existingTx.fundType} in ${currentYear}. Please set a budget first.` };
    }

    const quarterBudget = Number(budget[targetQuarter as keyof typeof budget]);
    
    // 3. Get all existing transactions for this quarter to calculate total spent
    const existingTransactions = await prisma.transaction.findMany({
      where: {
        profileId: activeProfileId,
        fundType: existingTx.fundType,
        type: TransactionType.EXPENSE,
        date: {
          gte: startDate,
          lt: endDate,
        }
      }
    });

    // 4. Calculate total spent, EXCLUDING the original amount of the transaction we are editing
    const totalSpentSoFar = existingTransactions.reduce((sum, t) => {
      if (t.id === id) return sum; // Skip the old amount
      return sum + Number(t.amount);
    }, 0);

    // 5. Check if the new transaction amount exceeds the remaining budget
    if (totalSpentSoFar + amount > quarterBudget) {
      const quarterName = targetQuarter.substring(0, 2).toUpperCase();
      const remaining = quarterBudget - totalSpentSoFar;
      return { 
        error: `Insufficient budget. The ${quarterName} budget only has ₱${remaining.toLocaleString('en-PH', {minimumFractionDigits: 2})} remaining, but you are trying to change this transaction to ₱${amount.toLocaleString('en-PH', {minimumFractionDigits: 2})}.` 
      };
    }

    await prisma.transaction.update({
      where: { id },
      data: {
        categoryId,
        amount,
        description: name,
        particulars: particulars || null,
        date: parsedDate,
      },
    });

    revalidatePath("/dashboard/budget-management");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating transaction:", error);
    return { error: "Failed to update transaction" };
  }
}

export async function deleteTransaction(id: string) {
  if (!id) {
    return { error: "Transaction ID is required" };
  }

  try {
    await prisma.transaction.delete({
      where: { id },
    });

    revalidatePath("/dashboard/budget-management");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return { error: "Failed to delete transaction" };
  }
}

export async function updateBudget(fundType: FundType, newAmountStr: string, periodKeyStr: string = "annual") {
  const activeProfileId = (await cookies()).get("denr_active_profile")?.value;
  if (!activeProfileId) return { error: "No active profile selected" };

  if (!isValidPeriodKey(periodKeyStr)) {
    return { error: "Invalid period key" };
  }
  const periodKey: PeriodKey = periodKeyStr as PeriodKey;

  const amount = parseFloat(newAmountStr.replace(/[^0-9.-]+/g, ""));
  
  if (isNaN(amount) || amount < 0) {
    return { error: "Invalid amount" };
  }

  const currentYear = new Date().getFullYear();

  try {
    const existingBudget = await prisma.budget.findFirst({
      where: {
        profileId: activeProfileId,
        fundType,
        year: currentYear,
      },
    });

    const currentTotal = existingBudget ? Number(existingBudget.totalAmount) : 0;
    const currentQ1 = existingBudget ? Number(existingBudget.q1Amount) : 0;
    const currentQ2 = existingBudget ? Number(existingBudget.q2Amount) : 0;
    const currentQ3 = existingBudget ? Number(existingBudget.q3Amount) : 0;
    const currentQ4 = existingBudget ? Number(existingBudget.q4Amount) : 0;

    let newTotal = currentTotal;
    let newQ1 = currentQ1;
    let newQ2 = currentQ2;
    let newQ3 = currentQ3;
    let newQ4 = currentQ4;

    if (periodKey === "annual") newTotal = amount;
    else if (periodKey === "q1") newQ1 = amount;
    else if (periodKey === "q2") newQ2 = amount;
    else if (periodKey === "q3") newQ3 = amount;
    else if (periodKey === "q4") newQ4 = amount;

    const sumOfQuarters = newQ1 + newQ2 + newQ3 + newQ4;

    if (periodKey !== "annual" && sumOfQuarters > newTotal) {
      return { error: `Total quarters sum (₱${sumOfQuarters.toLocaleString()}) cannot exceed Annual budget (₱${newTotal.toLocaleString()}).` };
    }
    
    if (periodKey === "annual" && newTotal < sumOfQuarters) {
      return { error: `Annual budget cannot be less than the sum of quarters (₱${sumOfQuarters.toLocaleString()}).` };
    }

    let updateData: any = {};
    if (periodKey === "annual") {
      updateData = { totalAmount: amount };
    } else {
      updateData = { 
        totalAmount: newTotal, // Optional: if you want to automatically increase annual budget when a quarter is set, you could do it here, but current logic enforces quarter sum <= annual
        q1Amount: newQ1,
        q2Amount: newQ2,
        q3Amount: newQ3,
        q4Amount: newQ4,
      };
    }

    if (existingBudget) {
      await prisma.budget.update({
        where: { id: existingBudget.id },
        data: updateData,
      });
    } else {
      await prisma.budget.create({
        data: {
          profileId: activeProfileId,
          fundType,
          year: currentYear,
          totalAmount: periodKey === "annual" ? amount : 0,
          q1Amount: periodKey === "q1" ? amount : 0,
          q2Amount: periodKey === "q2" ? amount : 0,
          q3Amount: periodKey === "q3" ? amount : 0,
          q4Amount: periodKey === "q4" ? amount : 0,
        },
      });
    }

    revalidatePath("/dashboard/budget-management");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating budget:", error);
    return { error: "Failed to update budget" };
  }
}
