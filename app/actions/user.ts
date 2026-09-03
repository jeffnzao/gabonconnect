"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateAvatarAction(userId: string, avatarUrl: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { image: avatarUrl },
    });

    revalidatePath("/");
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Erreur mise à jour avatar:", error);
    return { success: false, error: "Impossible de mettre à jour le profil." };
  }
}