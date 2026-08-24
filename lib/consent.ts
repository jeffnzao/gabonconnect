import { ConsentType } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";

export async function hasAdvertisingConsent(userId: string): Promise<boolean> {
  const consent = await prisma.userConsent.findUnique({ where: { userId_type: { userId, type: ConsentType.ADVERTISING } }, select: { granted: true } });
  return consent?.granted === true;
}