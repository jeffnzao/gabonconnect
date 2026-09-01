export const RELEVANCE_WEIGHTS = {
  gabon_direct: 40,
  gabon_nationals: 30,
  diaspora: 20,
  official_source: 20,
  eligible_opportunity: 15,
  bilateral_relation: 10,
  unrelated: -50,
  spam_off_topic: -100,
} as const;

export const GABON_DIRECT_TERMS = [
  "gabon", "libreville", "port-gentil", "port gentil", "franceville", "moanda", "oyem", "lambarene", "mouila", "tchibanga", "koulamoutou",
  "anbg", "dgbc", "ministere", "presidence", "republique gabonaise", "ambassade du gabon", "consulat du gabon",
  "estuaire", "haut-ogooue", "moyen-ogooue", "ngounie", "nyanga", "ogooue-ivindo", "ogooue-lolo", "ogooue-maritime", "woleu-ntem",
] as const;

export const GABON_NATIONAL_TERMS = ["gabonais", "gabonaise", "gabonaises", "ressortissant gabonais", "ressortissants gabonais"] as const;
export const DIASPORA_TERMS = ["diaspora", "communaute gabonaise", "etudiants gabonais", "gabonais de", "amicale gabonaise", "association des gabonais"] as const;
export const ELIGIBLE_OPPORTUNITY_TERMS = ["bourse", "scholarship", "appel a projets", "appel a projet", "stage", "emploi", "recrutement", "candidature", "financement", "subvention", "programme d'etudes"] as const;
export const BILATERAL_RELATION_TERMS = ["bilateral", "cooperation", "partenariat", "accord", "diplome conjoint", "double diplome", "convention"] as const;
export const SENSITIVE_TERMS = ["histoire", "historique", "politique", "election", "president", "presidence", "gouvernement", "justice", "judiciaire", "tribunal", "cour", "procureur", "condamnation", "enquete"] as const;
export const SPAM_TERMS = ["casino", "paris sportifs", "crypto", "bitcoin", "gagnez", "click here", "viagra", "adult", "porn"] as const;

export const OFFICIAL_SOURCE_TYPES = ["GOVERNMENT", "DIPLOMATIC"] as const;
