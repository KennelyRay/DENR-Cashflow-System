"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, signSessionToken } from "@/lib/auth-token";

export async function updateProfile(prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session?.userId) {
    return { error: "Unauthorized" };
  }

  const username = formData.get("username") as string;
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!username) {
    return { error: "Username is required" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId as string },
    });

    if (!user) {
      return { error: "User not found" };
    }

    // Check if changing username to one that already exists
    if (username !== user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUser) {
        return { error: "Username is already taken" };
      }
    }

    const updateData: { username: string; passwordHash?: string } = { username };

    // If attempting to change password
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword) {
        return { error: "Current password is required to set a new password" };
      }
      if (newPassword !== confirmPassword) {
        return { error: "New passwords do not match" };
      }
      if (newPassword.length < 6) {
        return { error: "New password must be at least 6 characters long" };
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return { error: "Incorrect current password" };
      }

      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    if (username !== user.username) {
      const token = await signSessionToken({ userId: user.id, username });
      (await cookies()).set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard", "layout");

    return { success: true, message: "Profile updated successfully!" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Failed to update profile" };
  }
}

export async function addUser(prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session?.userId) {
    return { error: "Unauthorized" };
  }

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!username || !password || !confirmPassword) {
    return { error: "All fields are required" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long" };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return { error: "Username is already taken" };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        passwordHash,
      },
    });

    revalidatePath("/dashboard/settings");
    return { success: true, message: "User added successfully!" };
  } catch (error) {
    console.error("Error adding user:", error);
    return { error: "Failed to add user" };
  }
}

export async function deleteUser(id: string) {
  const session = await getSession();
  if (!session?.userId) {
    return { error: "Unauthorized" };
  }

  if (id === session.userId) {
    return { error: "You cannot delete your own account" };
  }

  try {
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "Failed to delete user" };
  }
}

export async function updateUser(id: string, formData: FormData) {
  const session = await getSession();
  if (!session?.userId) {
    return { error: "Unauthorized" };
  }

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username) {
    return { error: "Username is required" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return { error: "User not found" };
    }

    if (username !== user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUser) {
        return { error: "Username is already taken" };
      }
    }

    const updateData: { username: string; passwordHash?: string } = { username };

    if (password) {
      if (password.length < 6) {
        return { error: "Password must be at least 6 characters long" };
      }
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    if (id === session.userId && username !== user.username) {
      const token = await signSessionToken({ userId: id, username });
      (await cookies()).set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard", "layout");
    return { success: true, message: "User updated successfully!" };
  } catch (error) {
    console.error("Error updating user:", error);
    return { error: "Failed to update user" };
  }
}
