import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { ProfileList } from "./profile-list";
import { redirect } from "next/navigation";

export default async function ProfilesPage() {
  const profiles = await prisma.budgetProfile.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const activeProfileId = (await cookies()).get("denr_active_profile")?.value;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Budget Profiles
        </h1>
        <p className="text-sm text-slate-500 mt-1">Select or create a Programs, Activities, and Projects (PaP) profile.</p>
      </div>

      <ProfileList 
        initialProfiles={profiles} 
        activeProfileId={activeProfileId} 
      />
    </div>
  );
}
