import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { SettingsForm } from "./settings-form";
import { UserManagement } from "./user-management";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    }
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account settings and system users.</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 animate-fade-in-up">
          <SettingsForm initialUsername={session.username} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <UserManagement users={users} currentUserId={session.userId} />
        </div>
      </div>
    </div>
  );
}
