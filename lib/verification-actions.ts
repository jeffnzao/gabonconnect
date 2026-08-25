"use server";

import { z } from "zod";
import { Prisma } from "@/app/generated/prisma";
import { ensureUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/imports";

const verificationDecisionSchema = z.object({
  targetType: z.enum(["profile", "association"]),
  targetId: z.string().min(1),
  action: z.enum(["approve", "reject", "revoke", "request"]),
  notes: z.string().max(500).optional().or(z.literal("")),
});

async function requireAdmin() {
  const user = await ensureUser();
  if (!user || !isAdminRole(user.role)) {
    throw new Error("Admin access required.");
  }
  return user;
}

export async function requestVerification(formData: FormData) {
  const targetType = String(formData.get("targetType") ?? "profile");
  const targetId = String(formData.get("targetId") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  const parsed = verificationDecisionSchema.safeParse({
    targetType: targetType === "association" ? "association" : "profile",
    targetId,
    action: "request",
    notes,
  });

  if (!parsed.success) {
    throw new Error("Invalid verification request.");
  }

  const user = await ensureUser();
  if (!user) throw new Error("Authentication required.");

  if (parsed.data.targetType === "profile") {
    const profile = await prisma.profile.findUnique({ where: { id: targetId }, select: { id: true, userId: true } });
    if (!profile || profile.userId !== user.id) throw new Error("You can only request verification for your own profile.");

    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        verificationStatus: "PENDING",
        isVerified: false,
        verificationNotes: notes || null,
        verifiedAt: null,
      },
    });

    return;
  }

  const association = await prisma.association.findUnique({ where: { id: targetId }, select: { id: true } });
  if (!association) throw new Error("Association not found.");

  const membership = await prisma.associationMember.findFirst({
    where: { associationId: association.id, profile: { userId: user.id } },
    select: { id: true },
  });

  if (!membership) throw new Error("Only an association member can request verification.");

  await prisma.association.update({
    where: { id: association.id },
    data: {
      verificationStatus: "PENDING",
      isVerified: false,
      verificationNotes: notes || null,
      verifiedAt: null,
    },
  });

  return;
}

export async function reviewVerification(formData: FormData) {
  const parsed = verificationDecisionSchema.safeParse({
    targetType: String(formData.get("targetType") ?? "profile"),
    targetId: String(formData.get("targetId") ?? ""),
    action: String(formData.get("action") ?? "approve"),
    notes: String(formData.get("notes") ?? ""),
  });

  if (!parsed.success) {
    throw new Error("Invalid verification decision.");
  }

  await requireAdmin();
  const { targetType, targetId, action, notes } = parsed.data;

  if (targetType === "profile") {
    const profile = await prisma.profile.findUnique({ where: { id: targetId }, select: { id: true } });
    if (!profile) throw new Error("Profile not found.");

    const nextState: Prisma.ProfileUpdateInput =
      action === "approve"
        ? {
            isVerified: true,
            verificationStatus: "VERIFIED",
            verifiedAt: new Date(),
            verificationNotes: notes || null,
          }
        : action === "reject"
          ? {
              isVerified: false,
              verificationStatus: "REJECTED",
              verifiedAt: null,
              verificationNotes: notes || null,
            }
          : {
              isVerified: false,
              verificationStatus: "UNVERIFIED",
              verifiedAt: null,
              verificationNotes: notes || null,
            };

    await prisma.profile.update({
      where: { id: profile.id },
      data: nextState,
    });

    return;
  }

  const association = await prisma.association.findUnique({ where: { id: targetId }, select: { id: true } });
  if (!association) throw new Error("Association not found.");

  const nextState: Prisma.AssociationUpdateInput =
    action === "approve"
      ? {
          isVerified: true,
          verificationStatus: "VERIFIED",
          verifiedAt: new Date(),
          verificationNotes: notes || null,
        }
      : action === "reject"
        ? {
            isVerified: false,
            verificationStatus: "REJECTED",
            verifiedAt: null,
            verificationNotes: notes || null,
          }
        : {
            isVerified: false,
            verificationStatus: "UNVERIFIED",
            verifiedAt: null,
            verificationNotes: notes || null,
          };

  await prisma.association.update({
    where: { id: association.id },
    data: nextState,
  });

  return;
}
