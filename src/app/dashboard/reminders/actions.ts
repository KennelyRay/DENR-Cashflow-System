"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addReminder(formData: FormData) {
  const message = formData.get("message") as string;
  const categoryId = formData.get("categoryId") as string;
  const dateStr = formData.get("date") as string;
  const time = formData.get("time") as string;

  if (!message || !dateStr) {
    return { error: "Message and date are required" };
  }

  try {
    await prisma.reminder.create({
      data: {
        message,
        categoryId: categoryId || null,
        date: new Date(dateStr),
        time: time || null,
      },
    });

    revalidatePath("/dashboard/reminders");
    return { success: true };
  } catch (error) {
    console.error("Failed to add reminder:", error);
    return { error: "Failed to add reminder" };
  }
}

export async function completeReminder(id: string) {
  try {
    await prisma.reminder.update({
      where: { id },
      data: { isCompleted: true },
    });

    revalidatePath("/dashboard/reminders");
    return { success: true };
  } catch (error) {
    console.error("Failed to complete reminder:", error);
    return { error: "Failed to complete reminder" };
  }
}

export async function deleteReminder(id: string) {
  try {
    await prisma.reminder.delete({
      where: { id },
    });

    revalidatePath("/dashboard/reminders");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete reminder:", error);
    return { error: "Failed to delete reminder" };
  }
}
