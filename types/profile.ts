export const PROFILE_STATUSES = [
  "STUDENT",
  "PROFESSIONAL",
  "ENTREPRENEUR",
  "ARTIST",
  "ASSOCIATION",
  "INSTITUTION",
] as const;

export type ProfileStatus = (typeof PROFILE_STATUSES)[number];

export const PROFILE_STATUS_LABELS: Record<ProfileStatus, string> = {
  STUDENT: "Étudiant",
  PROFESSIONAL: "Professionnel",
  ENTREPRENEUR: "Entrepreneur",
  ARTIST: "Artiste",
  ASSOCIATION: "Association",
  INSTITUTION: "Institution",
};

export interface ProfileLocationHierarchy {
  continent: string;
  country: string;
  city: string;
  originProvinceOrCity?: string;
}

export interface ProfileDirectoryFilters {
  status?: ProfileStatus;
  countrySlug?: string;
  citySlug?: string;
  interests?: string[];
}

export const PROFILE_INTERESTS = [
  "Entrepreneuriat",
  "Culture et arts",
  "Éducation",
  "Solidarité",
  "Technologie",
  "Sport",
  "Retour au Gabon",
] as const;

export type ProfileInterest = (typeof PROFILE_INTERESTS)[number];

export function getProfileStatusLabel(status: ProfileStatus): string {
  return PROFILE_STATUS_LABELS[status];
}
