import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import Sidebar from "./ui/sidebar";
import Header from "./ui/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session) redirect("/login");

  const activeProfileId = (await cookies()).get("denr_active_profile")?.value;
  let activeProfile = null;
  if (activeProfileId) {
    activeProfile = await prisma.budgetProfile.findUnique({
      where: { id: activeProfileId }
    });
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar activeProfile={activeProfile} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={session} activeProfile={activeProfile} />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
