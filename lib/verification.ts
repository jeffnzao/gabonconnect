export type VerificationState = {
  isVerified: boolean;
  verificationStatus: string | null;
};

export type VerificationBadgeState = VerificationState & {
  verifiedAt?: Date | null;
  verificationNotes?: string | null;
};

export function isVerificationApproved(value: VerificationState): boolean {
  return value.isVerified === true && value.verificationStatus === "VERIFIED";
}

export function canModerateVerificationStatus(role: string | null | undefined): boolean {
  return role === "ADMIN";
}

export function getVerificationBadgeText(value: VerificationBadgeState): string {
  if (isVerificationApproved(value)) return "Verified";
  if (value.verificationStatus === "PENDING") return "Pending";
  if (value.verificationStatus === "REJECTED") return "Rejected";
  return "Unverified";
}
