"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createProfile(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) return { error: "Name is required" };

  try {
    const profile = await prisma.budgetProfile.create({
      data: {
        name,
        description: description || null,
      },
    });

    (await cookies()).set("denr_active_profile", profile.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    revalidatePath("/dashboard", "layout");
    return { success: true, profile };
  } catch (e: any) {
    if (e.code === "P2002") {
      return { error: "A profile with this name already exists" };
    }
    return { error: "Failed to create profile" };
  }
}

export async function setActiveProfile(id: string) {
  if (!id) return { error: "Profile ID required" };
  
  (await cookies()).set("denr_active_profile", id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function deleteProfile(id: string) {
  if (!id) return { error: "Profile ID required" };

  try {
    // 1. Delete the profile (this will cascade delete budgets and transactions based on schema)
    await prisma.budgetProfile.delete({
      where: { id },
    });

    // 2. Check if the deleted profile was the active one
    const activeProfileId = (await cookies()).get("denr_active_profile")?.value;
    if (activeProfileId === id) {
      (await cookies()).delete("denr_active_profile");
    }

    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error deleting profile:", error);
    return { error: "Failed to delete profile" };
  }
}
