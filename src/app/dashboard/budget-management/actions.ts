"use server";

import { prisma } from "@/lib/prisma";
import { FundType, TransactionType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function addTransaction(formData: FormData) {
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

  try {
    await prisma.transaction.create({
      data: {
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

export async function updateBudget(fundType: FundType, newAmountStr: string) {
  const amount = parseFloat(newAmountStr.replace(/[^0-9.-]+/g, ""));
  
  if (isNaN(amount) || amount < 0) {
    return { error: "Invalid amount" };
  }

  const currentYear = new Date().getFullYear();

  try {
    const existingBudget = await prisma.budget.findFirst({
      where: {
        fundType,
        year: currentYear,
      },
    });

    if (existingBudget) {
      await prisma.budget.update({
        where: { id: existingBudget.id },
        data: { totalAmount: amount },
      });
    } else {
      await prisma.budget.create({
        data: {
          fundType,
          year: currentYear,
          totalAmount: amount,
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
