"use server";

import { UserProcedureStatus } from "@/app/generated/prisma";
import { ensureUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function toggleProcedureStep(procedureId: string, stepId: string, completed: boolean) {
  const user = await ensureUser();
  if (!user) throw new Error("Authentication required.");

  const step = await prisma.procedureStep.findFirst({ where: { id: stepId, procedureId }, select: { id: true } });
  if (!step) throw new Error("Procedure step not found.");

  const current = await prisma.userProcedureProgress.findUnique({ where: { userId_procedureId: { userId: user.id, procedureId } }, select: { completedStepIds: true } });
  const completedIds = new Set(current?.completedStepIds ?? []);
  if (completed) completedIds.add(stepId);
  else completedIds.delete(stepId);

  const totalSteps = await prisma.procedureStep.count({ where: { procedureId } });
  const completedStepIds = [...completedIds].filter((id) => id !== "");
  const status = completedStepIds.length === 0 ? UserProcedureStatus.NOT_STARTED : completedStepIds.length >= totalSteps ? UserProcedureStatus.COMPLETED : UserProcedureStatus.IN_PROGRESS;

  return prisma.userProcedureProgress.upsert({
    where: { userId_procedureId: { userId: user.id, procedureId } },
    create: { userId: user.id, procedureId, completedStepIds, status },
    update: { completedStepIds, status },
    select: { status: true, completedStepIds: true, updatedAt: true },
  });
}
