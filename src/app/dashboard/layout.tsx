import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Sidebar from "./ui/sidebar";
import Header from "./ui/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  // The middleware already protects this route, but this ensures we have the session
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={session} />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
