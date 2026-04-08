import { prisma } from "@/lib/prisma";
import { RemindersClient } from "./reminders-client";

export default async function RemindersPage() {
  const categories = await prisma.category.findMany();
  
  const activeReminders = await prisma.reminder.findMany({
    where: {
      isCompleted: false,
    },
    include: {
      category: true,
    },
    orderBy: [
      { date: 'asc' },
      { time: 'asc' }
    ],
  });

  const completedReminders = await prisma.reminder.findMany({
    where: {
      isCompleted: true,
    },
    include: {
      category: true,
    },
    orderBy: [
      { updatedAt: 'desc' }
    ],
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Reminders
        </h1>
        <p className="text-sm text-slate-500 mt-1">Set reminders to check your budget and expenses</p>
      </div>

      <div className="animate-fade-in-up">
        <RemindersClient 
          categories={categories} 
          initialReminders={activeReminders} 
          initialHistory={completedReminders} 
        />
      </div>
    </div>
  );
}
