// Seed de démonstration GabonConnect.
// Toutes les données ci-dessous sont FICTIVES : aucune personne réelle,
// aucun email réel, aucune donnée personnelle réelle n'est utilisée.
//
// Note sur User.id : en production, cet id provient de Supabase Auth
// (auth.users.id). Comme ce seed ne crée pas de vrais comptes Supabase,
// on génère des UUID aléatoires pour simuler des comptes de démonstration.

import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
// seed.ts
import { PrismaClient, ProfileVisibility, AssociationStatus, Role, AdministrativeProcedureCategory, ScholarshipLevel, ConsulateType, SourceRegistryType } from "../app/generated/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── 1. CONTINENTS ──────────────────────────────────────────────
  // Slugs normalisés en anglais (voir prisma/scripts/rename-continent-slugs.ts
  // pour la migration des données déjà en base avec les anciens slugs FR).
  const continentsData = [
    { name: "Afrique", slug: "africa", code: "AF" },
    { name: "Europe", slug: "europe", code: "EU" },
    { name: "Amérique du Nord", slug: "north-america", code: "NA" },
    { name: "Amérique du Sud", slug: "south-america", code: "SA" },
    { name: "Asie", slug: "asia", code: "AS" },
    { name: "Océanie", slug: "oceania", code: "OC" },
  ];

  const continents: Record<string, { id: string }> = {};
  for (const c of continentsData) {
    const created = await prisma.continent.upsert({
      where: { code: c.code },
      update: { name: c.name, slug: c.slug },
      create: c,
    });
    continents[c.code] = created;
  }

  // ── 2. PAYS ─────────────────────────────────────────────────────
  const countriesData = [
    { name: "Gabon", slug: "gabon", code: "GA", continent: "AF" },
    { name: "Sénégal", slug: "senegal", code: "SN", continent: "AF" },
    { name: "Côte d'Ivoire", slug: "cote-d-ivoire", code: "CI", continent: "AF" },
    { name: "Maroc", slug: "maroc", code: "MA", continent: "AF" },
    { name: "France", slug: "france", code: "FR", continent: "EU" },
    { name: "Belgique", slug: "belgique", code: "BE", continent: "EU" },
    { name: "Royaume-Uni", slug: "royaume-uni", code: "GB", continent: "EU" },
    { name: "Allemagne", slug: "allemagne", code: "DE", continent: "EU" },
    { name: "Canada", slug: "canada", code: "CA", continent: "NA" },
    { name: "États-Unis", slug: "etats-unis", code: "US", continent: "NA" },
  ];

  const countries: Record<string, { id: string }> = {};
  for (const c of countriesData) {
    const created = await prisma.country.upsert({
      where: { code: c.code },
      update: {
        name: c.name,
        slug: c.slug,
        continentId: continents[c.continent].id,
      },
      create: {
        name: c.name,
        slug: c.slug,
        code: c.code,
        continentId: continents[c.continent].id,
      },
    });
    countries[c.slug] = created;
  }

  // ── 3. VILLES ───────────────────────────────────────────────────
  const citiesData = [
    { name: "Libreville", slug: "libreville", country: "gabon", lat: 0.4162, lng: 9.4673 },
    { name: "Port-Gentil", slug: "port-gentil", country: "gabon", lat: -0.7193, lng: 8.7815 },
    { name: "Gamba", slug: "gamba", country: "gabon", lat: -2.65, lng: 10.0 },
    { name: "Paris", slug: "paris", country: "france", lat: 48.8566, lng: 2.3522 },
    { name: "Lyon", slug: "lyon", country: "france", lat: 45.764, lng: 4.8357 },
    { name: "Marseille", slug: "marseille", country: "france", lat: 43.2965, lng: 5.3698 },
    { name: "Bruxelles", slug: "bruxelles", country: "belgique", lat: 50.8503, lng: 4.3517 },
    { name: "Montréal", slug: "montreal", country: "canada", lat: 45.5019, lng: -73.5674 },
    { name: "Toronto", slug: "toronto", country: "canada", lat: 43.6511, lng: -79.3832 },
    { name: "New York", slug: "new-york", country: "etats-unis", lat: 40.7128, lng: -74.006 },
    { name: "Dakar", slug: "dakar", country: "senegal", lat: 14.7167, lng: -17.4677 },
    { name: "Abidjan", slug: "abidjan", country: "cote-d-ivoire", lat: 5.36, lng: -4.0083 },
    { name: "Casablanca", slug: "casablanca", country: "maroc", lat: 33.5731, lng: -7.5898 },
    { name: "Londres", slug: "londres", country: "royaume-uni", lat: 51.5074, lng: -0.1278 },
    { name: "Berlin", slug: "berlin", country: "allemagne", lat: 52.52, lng: 13.405 },
  ];

  const cities: Record<string, { id: string }> = {};
  for (const c of citiesData) {
    const created = await prisma.city.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        name: c.name,
        slug: c.slug,
        countryId: countries[c.country].id,
        latitude: c.lat,
        longitude: c.lng,
      },
    });
    cities[c.slug] = created;
  }

  // ── 4. UTILISATEURS + PROFILS FICTIFS ──────────────────────────
  const demoMembers = [
    {
      email: "demo.membre1@example.com",
      firstName: "Awa",
      lastName: "Nzamba",
      profession: "Ingénieure logiciel",
      bio: "Membre de la diaspora gabonaise à Paris, passionnée de tech.",
      city: "paris",
      visibility: ProfileVisibility.PUBLIC,
      role: Role.USER,
    },
    {
      email: "demo.membre2@example.com",
      firstName: "Steve",
      lastName: "Obiang",
      profession: "Consultant finance",
      bio: "Basé à Montréal, engagé dans le développement de Gamba.",
      city: "montreal",
      visibility: ProfileVisibility.PUBLIC,
      role: Role.USER,
    },
    {
      email: "demo.membre3@example.com",
      firstName: "Sarah",
      lastName: "Moussavou",
      profession: "Médecin",
      bio: "Profil privé de démonstration.",
      city: "libreville",
      visibility: ProfileVisibility.PRIVATE,
      role: Role.USER,
    },
    {
      email: "demo.admin@example.com",
      firstName: "Admin",
      lastName: "GabonConnect",
      profession: "Administration plateforme",
      bio: "Compte administrateur de démonstration.",
      city: "libreville",
      visibility: ProfileVisibility.PRIVATE,
      role: Role.ADMIN,
    },
  ];

  const users: Record<string, { id: string }> = {};
  for (const m of demoMembers) {
    const user = await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: {
        id: randomUUID(),
        email: m.email,
        role: m.role,
      },
    });
    users[m.email] = user;

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: m.firstName,
        lastName: m.lastName,
        profession: m.profession,
        bio: m.bio,
        visibility: m.visibility,
        cityId: cities[m.city].id,
      },
    });
  }

  // ── 5. ASSOCIATIONS FICTIVES ───────────────────────────────────
  const associationsData = [
    {
      name: "Association des Gabonais de Paris",
      slug: "association-gabonais-paris",
      description: "Association fictive de démonstration réunissant la diaspora gabonaise à Paris.",
      city: "paris",
      status: AssociationStatus.APPROVED,
    },
    {
      name: "Collectif Gamba Développement",
      slug: "collectif-gamba-developpement",
      description: "Association fictive de démonstration dédiée au développement de la commune de Gamba.",
      city: "gamba",
      status: AssociationStatus.APPROVED,
    },
    {
      name: "Réseau Diaspora Montréal",
      slug: "reseau-diaspora-montreal",
      description: "Association fictive de démonstration, en attente de modération.",
      city: "montreal",
      status: AssociationStatus.PENDING,
    },
  ];

  for (const a of associationsData) {
    await prisma.association.upsert({
      where: { slug: a.slug },
      update: {},
      create: {
        name: a.name,
        slug: a.slug,
        description: a.description,
        cityId: cities[a.city].id,
        status: a.status,
      },
    });
  }

  const consulates = [
    { id: "consulate-embassy-france", name: "Ambassade du Gabon en France", type: ConsulateType.EMBASSY, country: "France", city: "Paris", address: "26 bis avenue Raphaël, 75016 Paris", phone: "+33 1 42 99 68 68", email: "ambassade@gabonfrance.com", website: "https://www.ambassadedugabon.fr/", openingHours: "Lundi au vendredi, 09:00-15:00", jurisdiction: "France", latitude: 48.8566, longitude: 2.3522 },
    { id: "consulate-general-paris", name: "Consulat Général du Gabon à Paris", type: ConsulateType.CONSULATE_GENERAL, country: "France", city: "Paris", address: "41 rue de la Bienfaisance, 75008 Paris", phone: "+33 1 40 04 90 13", email: "consulat@gabonfrance.com", website: "https://www.ambassadedugabon.fr/", openingHours: "Lundi au vendredi, 09:00-14:00", jurisdiction: "France", latitude: 48.876, longitude: 2.316 },
    { id: "embassy-canada", name: "Ambassade du Gabon au Canada", type: ConsulateType.EMBASSY, country: "Canada", city: "Ottawa", address: "4 Range Road, Ottawa, ON K1N 8J5", phone: "+1 613 232 5301", email: "info@ambassadedugabon.ca", website: "https://ambassadedugabon.ca/", openingHours: "Monday to Friday, 09:00-15:00", jurisdiction: "Canada", latitude: 45.4215, longitude: -75.6972 },
    { id: "embassy-usa", name: "Ambassade du Gabon aux Etats-Unis", type: ConsulateType.EMBASSY, country: "Etats-Unis", city: "Washington", address: "2033 20th Street NW, Washington DC 20009", phone: "+1 202 797 1000", email: "info@gabonembassyusa.org", website: "https://gabonembassyusa.org/", openingHours: "Monday to Friday, 09:00-15:00", jurisdiction: "United States", latitude: 38.9072, longitude: -77.0369 },
    { id: "embassy-china", name: "Ambassade du Gabon en Chine", type: ConsulateType.EMBASSY, country: "Chine", city: "Pekin", address: "No. 36 Dong Zhi Men Wai Da Jie, Beijing", phone: "+86 10 6532 2822", email: "ambassadegabonchine@gmail.com", website: "https://www.diplomatie.gouv.ga/", openingHours: "Monday to Friday, 09:00-15:00", jurisdiction: "China", latitude: 39.9042, longitude: 116.4074 },
    { id: "embassy-morocco", name: "Ambassade du Gabon au Maroc", type: ConsulateType.EMBASSY, country: "Maroc", city: "Rabat", address: "Rue Oued Fes, Souissi, Rabat", phone: "+212 537 63 90 80", email: "ambgabon.rabat@gmail.com", website: "https://www.diplomatie.gouv.ga/", openingHours: "Lundi au vendredi, 09:00-15:00", jurisdiction: "Morocco", latitude: 34.0209, longitude: -6.8416 },
    { id: "embassy-senegal", name: "Ambassade du Gabon au Senegal", type: ConsulateType.EMBASSY, country: "Senegal", city: "Dakar", address: "Rue Aime Cesaire, Dakar", phone: "+221 33 823 91 53", email: "ambassadedugabon.sn@gmail.com", website: "https://www.diplomatie.gouv.ga/", openingHours: "Lundi au vendredi, 09:00-15:00", jurisdiction: "Senegal", latitude: 14.7167, longitude: -17.4677 },
  ];
  for (const consulate of consulates) await prisma.consulate.upsert({ where: { id: consulate.id }, update: consulate, create: consulate });

  const procedures = [
    {
      slug: "passeport-renouvellement",
      title: "Renouvellement du passeport biometrique gabonais",
      description: "Pieces a fournir (ancien passeport, 2 photos d'identite, justificatif de domicile, acte de naissance), tarifs consulaires en vigueur et delai indicatif de traitement pour le renouvellement de votre passeport biometrique.",
      category: AdministrativeProcedureCategory.CONSULAR,
      estimatedDays: 30,
      cost: "Selon le tarif du consulat (bareme consulaire officiel)",
      officialUrl: "https://www.diplomatie.gouv.ga/",
      sourceName: "Ministere des Affaires Etrangeres du Gabon",
      canonicalUrl: "https://www.diplomatie.gouv.ga/",
      steps: [
        ["Verifier les conditions", "Confirmez la procedure et le bareme tarifaire aupres de votre consulat.", true],
        ["Rassembler les pieces", "Preparez votre ancien passeport, vos photos et les justificatifs demandes.", true],
        ["Prendre rendez-vous", "Utilisez le portail officiel ou contactez votre representation consulaire.", true],
        ["Deposer le dossier", "Presentez les originaux et reglez les frais applicables.", true],
        ["Retirer le passeport", "Suivez la notification du consulat pour le retrait.", true],
      ],
    },
    {
      slug: "immatriculation-consulaire",
      title: "Immatriculation consulaire (carte consulaire)",
      description: "Etablissez votre carte consulaire pour faciliter vos demarches en tant que membre de la diaspora aupres de votre consulat de residence.",
      category: AdministrativeProcedureCategory.CONSULAR,
      estimatedDays: 7,
      cost: "Gratuit ou selon le consulat",
      officialUrl: "https://www.diplomatie.gouv.ga/",
      sourceName: "Ambassade du Gabon en France",
      canonicalUrl: "https://www.ambassadedugabon.fr/",
      steps: [
        ["Identifier votre consulat", "Trouvez la representation competente pour votre lieu de residence.", true],
        ["Preparer vos justificatifs", "Rassemblez une piece d'identite et un justificatif de residence.", true],
        ["Remplir le formulaire", "Completez le formulaire d'immatriculation fourni par le consulat.", true],
        ["Valider l'inscription", "Deposez ou envoyez votre dossier selon les instructions officielles.", true],
      ],
    },
    {
      slug: "acte-naissance",
      title: "Demande d'acte de naissance",
      description: "Preparez une demande d'acte d'etat civil aupres de l'autorite competente.",
      category: AdministrativeProcedureCategory.CONSULAR,
      estimatedDays: 15,
      cost: "Selon le service sollicite",
      officialUrl: "https://www.diplomatie.gouv.ga/",
      sourceName: "Ministere des Affaires Etrangeres du Gabon",
      canonicalUrl: "https://www.diplomatie.gouv.ga/",
      steps: [
        ["Preciser le document", "Determinez la copie ou l'extrait necessaire pour votre demarche.", true],
        ["Rassembler les informations", "Preparez les informations d'etat civil et les justificatifs disponibles.", true],
        ["Envoyer la demande", "Suivez les instructions du consulat ou de la mairie competente.", true],
        ["Recevoir le document", "Verifiez les informations avant de l'utiliser dans une autre procedure.", true],
      ],
    },
    {
      slug: "attestation-non-boursier",
      title: "Attestation de non-boursier",
      description: "Suivez les etapes de preparation d'une attestation pour un dossier etudiant ou Campus.",
      category: AdministrativeProcedureCategory.INTEGRATION,
      estimatedDays: 14,
      cost: "Selon les conditions de l'organisme",
      officialUrl: "https://www.dgbc.gouv.ga/",
      sourceName: "DGBC - Direction Generale des Bourses du Gabon",
      canonicalUrl: "https://www.dgbc.gouv.ga/",
      steps: [
        ["Verifier l'organisme demandeur", "Confirmez le format et la periode attendus par votre etablissement.", true],
        ["Preparer votre dossier", "Rassemblez votre identite, votre inscription et les justificatifs de scolarite.", true],
        ["Soumettre la demande", "Transmettez le dossier au service DGBC ou Campus indique.", true],
        ["Archiver l'attestation", "Conservez le document et verifiez sa date de validite.", true],
      ],
    },
    {
      slug: "visa-court-sejour",
      title: "Demande de visa court sejour pour le Gabon",
      description: "Constituez votre dossier de visa court sejour (tourisme, affaires ou visite familiale) aupres d'une representation diplomatique gabonaise.",
      category: AdministrativeProcedureCategory.CONSULAR,
      estimatedDays: 10,
      cost: "Selon le bareme consulaire en vigueur",
      officialUrl: "https://www.diplomatie.gouv.ga/",
      sourceName: "Ministere des Affaires Etrangeres du Gabon",
      canonicalUrl: "https://www.diplomatie.gouv.ga/",
      steps: [
        ["Determiner le type de visa", "Identifiez le motif du sejour et la duree requise.", true],
        ["Constituer le dossier", "Reunissez passeport valide, formulaire, photo et justificatifs de voyage.", true],
        ["Deposer la demande", "Presentez le dossier aupres de l'ambassade ou du consulat competent.", true],
        ["Suivre l'instruction", "Patientez le delai de traitement avant retrait du visa.", true],
      ],
    },
    {
      slug: "legalisation-documents",
      title: "Legalisation de documents officiels gabonais",
      description: "Faites authentifier vos documents administratifs gabonais (diplomes, actes, attestations) pour qu'ils soient reconnus a l'etranger.",
      category: AdministrativeProcedureCategory.CONSULAR,
      estimatedDays: 12,
      cost: "Selon la nature du document",
      officialUrl: "https://www.diplomatie.gouv.ga/",
      sourceName: "Ministere des Affaires Etrangeres du Gabon",
      canonicalUrl: "https://www.diplomatie.gouv.ga/",
      steps: [
        ["Verifier l'exigence de legalisation", "Confirmez si l'organisme destinataire exige une legalisation ou une apostille.", true],
        ["Preparer les originaux", "Rassemblez les documents originaux et leurs copies certifiees.", true],
        ["Deposer aupres du consulat", "Soumettez le dossier au service competent de la representation gabonaise.", true],
        ["Recuperer le document legalise", "Verifiez le cachet et la signature avant utilisation.", true],
      ],
    },
    {
      slug: "titre-sejour-france",
      title: "Titre de sejour et integration en France",
      description: "Reperes pour la demande ou le renouvellement de titre de sejour et les etapes d'integration des Gabonais residant en France (OFII, prefecture, CAF).",
      category: AdministrativeProcedureCategory.INTEGRATION,
      estimatedDays: 90,
      cost: "Timbres fiscaux et taxes prefectorales selon le titre",
      officialUrl: "https://www.ambassadedugabon.fr/",
      sourceName: "Ambassade du Gabon en France",
      canonicalUrl: "https://www.ambassadedugabon.fr/",
      steps: [
        ["Identifier le titre concerne", "Determinez le titre de sejour applicable a votre situation (etudiant, salarie, vie privee et familiale).", true],
        ["Preparer le dossier prefectoral", "Rassemblez passeport, justificatifs de ressources et de logement.", true],
        ["Deposer la demande", "Soumettez le dossier en prefecture ou via le portail dedie dans les delais legaux.", true],
        ["Suivre l'integration", "Completez le parcours OFII (visite medicale, formation civique) si requis.", true],
      ],
    },
    {
      slug: "titre-sejour-senegal",
      title: "Titre de sejour et integration au Senegal",
      description: "Etapes pour la carte de sejour et l'integration des Gabonais residant au Senegal, en lien avec l'ambassade du Gabon a Dakar.",
      category: AdministrativeProcedureCategory.INTEGRATION,
      estimatedDays: 45,
      cost: "Selon le bareme de la Direction de la Police des Etrangers",
      officialUrl: "https://www.diplomatie.gouv.ga/",
      sourceName: "Ambassade du Gabon au Senegal",
      canonicalUrl: "https://www.diplomatie.gouv.ga/",
      steps: [
        ["Signaler votre arrivee", "Immatriculez-vous aupres de l'ambassade du Gabon a Dakar.", true],
        ["Constituer le dossier de sejour", "Preparez passeport, justificatif de logement et attestation d'activite.", true],
        ["Deposer la demande", "Soumettez le dossier a la Direction de la Police des Etrangers et des Titres de Voyage.", true],
        ["Retirer la carte de sejour", "Recuperez le titre selon le delai communique.", true],
      ],
    },
    {
      slug: "titre-sejour-maroc",
      title: "Titre de sejour et integration au Maroc",
      description: "Etapes pour la carte d'immatriculation et l'integration des Gabonais residant au Maroc (etudiants et professionnels), en lien avec l'ambassade du Gabon a Rabat.",
      category: AdministrativeProcedureCategory.INTEGRATION,
      estimatedDays: 45,
      cost: "Selon le bareme de la Direction Generale de la Surete Nationale",
      officialUrl: "https://www.diplomatie.gouv.ga/",
      sourceName: "Ambassade du Gabon au Maroc",
      canonicalUrl: "https://www.diplomatie.gouv.ga/",
      steps: [
        ["Signaler votre arrivee", "Immatriculez-vous aupres de l'ambassade du Gabon a Rabat.", true],
        ["Constituer le dossier", "Preparez passeport, justificatif d'inscription ou de contrat et justificatif de logement.", true],
        ["Deposer la demande", "Soumettez le dossier a la Direction Generale de la Surete Nationale.", true],
        ["Retirer la carte d'immatriculation", "Recuperez le titre selon le delai communique.", true],
      ],
    },
    {
      slug: "titre-sejour-canada",
      title: "Titre de sejour et integration au Canada",
      description: "Reperes pour le permis d'etudes ou de travail et l'integration des Gabonais residant au Canada, en lien avec l'ambassade du Gabon a Ottawa.",
      category: AdministrativeProcedureCategory.INTEGRATION,
      estimatedDays: 60,
      cost: "Frais IRCC selon le type de permis",
      officialUrl: "https://ambassadedugabon.ca/",
      sourceName: "Ambassade du Gabon au Canada",
      canonicalUrl: "https://ambassadedugabon.ca/",
      steps: [
        ["Identifier le permis requis", "Determinez s'il s'agit d'un permis d'etudes, de travail ou de residence temporaire.", true],
        ["Preparer le dossier IRCC", "Rassemblez lettre d'admission ou d'emploi, preuve de fonds et passeport valide.", true],
        ["Soumettre la demande en ligne", "Deposez le dossier via le portail Immigration, Refugies et Citoyennete Canada.", true],
        ["Signaler votre arrivee au consulat", "Immatriculez-vous aupres de l'ambassade du Gabon a Ottawa.", true],
      ],
    },
  ] as const;

  for (const procedureData of procedures) {
    const procedure = await prisma.administrativeProcedure.upsert({
      where: { slug: procedureData.slug },
      update: { title: procedureData.title, description: procedureData.description, category: procedureData.category, estimatedDays: procedureData.estimatedDays, cost: procedureData.cost, officialUrl: procedureData.officialUrl, sourceName: procedureData.sourceName, canonicalUrl: procedureData.canonicalUrl, moderationStatus: "APPROVED", publishedAt: new Date() },
      create: { slug: procedureData.slug, title: procedureData.title, description: procedureData.description, category: procedureData.category, estimatedDays: procedureData.estimatedDays, cost: procedureData.cost, officialUrl: procedureData.officialUrl, sourceName: procedureData.sourceName, canonicalUrl: procedureData.canonicalUrl, moderationStatus: "APPROVED", publishedAt: new Date() },
    });
    for (const [index, [title, description, isRequired]] of procedureData.steps.entries()) {
      await prisma.procedureStep.upsert({ where: { procedureId_order: { procedureId: procedure.id, order: index + 1 } }, update: { title, description, isRequired }, create: { procedureId: procedure.id, order: index + 1, title, description, isRequired } });
    }
  }

  const scholarships = [
    { id: "scholarship-campus-france", title: "Bourse Campus France", provider: "Campus France", country: "France", level: ScholarshipLevel.MASTER, description: "Opportunite de financement pour un projet d'etudes superieures en France, ouverte aux etudiants gabonais.", eligibilityCriteria: "Consultez les conditions et le calendrier de l'appel officiel Campus France.", deadline: new Date("2027-01-31"), applicationUrl: "https://www.campusfrance.org/", sourceName: "Campus France", canonicalUrl: "https://www.campusfrance.org/" },
    { id: "scholarship-dgbc-excellence", title: "Bourse d'excellence DGBC", provider: "DGBC", country: "Gabon", level: ScholarshipLevel.LICENCE, description: "Aide a la preparation d'un dossier de bourse d'excellence gabonaise.", eligibilityCriteria: "Verifiez les criteres publies par la DGBC pour votre campagne.", deadline: new Date("2027-02-28"), applicationUrl: "https://www.dgbc.gouv.ga/", sourceName: "DGBC - Direction Generale des Bourses du Gabon", canonicalUrl: "https://www.dgbc.gouv.ga/" },
    { id: "scholarship-anbg-orientation-afrique", title: "Orientation ANBG : priorite aux etablissements africains", provider: "ANBG (Agence Nationale des Bourses du Gabon)", country: "Gabon", level: ScholarshipLevel.LICENCE, description: "Politique d'orientation actuelle de l'ANBG : priorite donnee aux ecoles et universites africaines ainsi qu'au renforcement des etablissements nationaux gabonais dans l'attribution des nouvelles bourses.", eligibilityCriteria: "Reservee aux etudiants gabonais admis dans un etablissement africain reconnu ou un etablissement national partenaire ; verifiez la circulaire d'orientation en vigueur.", deadline: new Date("2027-03-31"), applicationUrl: "https://www.dgbc.gouv.ga/", sourceName: "ANBG - Agence Nationale des Bourses du Gabon", canonicalUrl: null },
    { id: "scholarship-bilaterale-maroc", title: "Bourse gouvernementale bilaterale Maroc-Gabon", provider: "Cooperation Maroc-Gabon", country: "Maroc", level: ScholarshipLevel.LICENCE, description: "Programme bilateral de bourses d'etudes destine aux etudiants gabonais admis dans un etablissement superieur marocain partenaire.", eligibilityCriteria: "Etudiants gabonais titulaires du baccalaureat, dossier valide par le Ministere des Affaires Etrangeres du Gabon et l'ambassade concernee.", deadline: new Date("2027-04-30"), applicationUrl: "https://www.diplomatie.gouv.ga/", sourceName: "Ministere des Affaires Etrangeres du Gabon", canonicalUrl: "https://www.diplomatie.gouv.ga/" },
    { id: "scholarship-bilaterale-senegal", title: "Bourse bilaterale Senegal-Gabon", provider: "Cooperation Senegal-Gabon", country: "Senegal", level: ScholarshipLevel.MASTER, description: "Programme bilateral de bourses de master destine aux etudiants gabonais admis dans un etablissement senegalais partenaire.", eligibilityCriteria: "Etudiants gabonais titulaires d'une licence, dossier valide par le Ministere des Affaires Etrangeres du Gabon et l'ambassade a Dakar.", deadline: new Date("2027-05-31"), applicationUrl: "https://www.diplomatie.gouv.ga/", sourceName: "Ministere des Affaires Etrangeres du Gabon", canonicalUrl: "https://www.diplomatie.gouv.ga/" },
  ];
  for (const scholarship of scholarships) {
    await prisma.scholarship.upsert({ where: { id: scholarship.id }, update: { ...scholarship, moderationStatus: "APPROVED", publishedAt: new Date() }, create: { ...scholarship, moderationStatus: "APPROVED", publishedAt: new Date() } });
  }

  const housingOffers = [
    { id: "housing-guide-paris", city: "Paris", country: "France", type: "STUDIO" as const, price: 750, description: "Guide logement etudiant a Paris : dossier CROUS/CAF a deposer des l'admission, colocation via les reseaux de la diaspora, et quartiers proches des campus prises frequentes par les etudiants gabonais. Conseil partage par l'Association des Gabonais de Paris.", contactEmail: "logement.paris@gabonconnect.example", author: "demo.admin@example.com" },
    { id: "housing-guide-montreal", city: "Montreal", country: "Canada", type: "COLOCATION" as const, price: 650, description: "Guide logement etudiant a Montreal : bail conjoint, garant ou depot de garantie selon le proprietaire, et reseau de colocation entre etudiants gabonais du Reseau Diaspora Montreal.", contactEmail: "logement.montreal@gabonconnect.example", author: "demo.membre2@example.com" },
    { id: "housing-guide-dakar", city: "Dakar", country: "Senegal", type: "CHAMBRE" as const, price: 120000, description: "Guide logement etudiant a Dakar : quartiers proches des universites (Fann, Point E), demarches aupres du proprietaire et recommandations de l'ambassade du Gabon au Senegal pour les nouveaux arrivants.", contactEmail: "logement.dakar@gabonconnect.example", author: "demo.admin@example.com" },
    { id: "housing-guide-casablanca", city: "Casablanca", country: "Maroc", type: "SOUS_LOCATION" as const, price: 2500, description: "Guide logement etudiant a Casablanca : sous-location courante entre etudiants internationaux, verification du contrat aupres de l'ambassade du Gabon au Maroc avant signature.", contactEmail: "logement.casablanca@gabonconnect.example", author: "demo.admin@example.com" },
  ];
  for (const offer of housingOffers) {
    const authorId = users[offer.author].id;
    await prisma.housingOffer.upsert({
      where: { id: offer.id },
      update: { city: offer.city, country: offer.country, type: offer.type, price: offer.price, description: offer.description, contactEmail: offer.contactEmail, authorId },
      create: { id: offer.id, city: offer.city, country: offer.country, type: offer.type, price: offer.price, description: offer.description, contactEmail: offer.contactEmail, authorId },
    });
  }

  const opportunities = [
    { id: "opportunity-ingenieur-petrolier-port-gentil", title: "Ingenieur petrolier - Port-Gentil", description: "Poste d'ingenieur petrolier base a Port-Gentil, au sein d'un operateur actif dans le bassin sedimentaire gabonais. Experience en production offshore appreciee.", type: "JOB" as const, location: "Port-Gentil, Gabon", sourceName: "Gabon Media Time", canonicalUrl: null as string | null },
    { id: "opportunity-charge-communication-libreville", title: "Charge(e) de communication - Ministere de l'Economie", description: "Mission de communication institutionnelle aupres d'un ministere a Libreville, redaction de contenus et relations presse.", type: "JOB" as const, location: "Libreville, Gabon", sourceName: "L'Union", canonicalUrl: null as string | null },
    { id: "opportunity-stage-ingenierie-miniere-moanda", title: "Stage ingenierie miniere - Moanda", description: "Stage de fin d'etudes en ingenierie miniere au sein d'un site d'exploitation a Moanda, encadrement par des ingenieurs seniors.", type: "INTERNSHIP" as const, location: "Moanda, Gabon", sourceName: "Gabon Media Time", canonicalUrl: null as string | null },
    { id: "opportunity-technicien-forestier-franceville", title: "Technicien forestier - Franceville", description: "Poste de technicien pour le suivi et la gestion durable d'exploitations forestieres dans la region de Franceville.", type: "JOB" as const, location: "Franceville, Gabon", sourceName: "L'Union", canonicalUrl: null as string | null },
    { id: "opportunity-volontariat-diaspora-paris", title: "Programme de volontariat de la diaspora gabonaise", description: "Programme de volontariat coordonne par l'ambassade pour mobiliser la diaspora gabonaise de France autour de projets communautaires et culturels.", type: "VOLUNTEERING" as const, location: "Paris, France", sourceName: "Ambassade du Gabon en France", canonicalUrl: "https://www.ambassadedugabon.fr/" as string | null },
    { id: "opportunity-appel-projets-jeunes-entrepreneurs", title: "Appel a projets - Jeunes entrepreneurs de la diaspora gabonaise", description: "Appel a projets destine aux jeunes entrepreneurs gabonais de la diaspora souhaitant investir ou lancer une activite au Gabon.", type: "PROJECT_CALL" as const, location: "Remote", sourceName: "ANBG - Agence Nationale des Bourses du Gabon", canonicalUrl: null as string | null },
  ];
  for (const opportunity of opportunities) {
    const slug = `${opportunity.id}`;
    await prisma.opportunity.upsert({
      where: { id: opportunity.id },
      update: { title: opportunity.title, description: opportunity.description, type: opportunity.type, location: opportunity.location, sourceName: opportunity.sourceName, canonicalUrl: opportunity.canonicalUrl ?? null, status: "PUBLISHED", moderationStatus: "APPROVED", publishedAt: new Date() },
      create: { id: opportunity.id, title: opportunity.title, slug, description: opportunity.description, type: opportunity.type, location: opportunity.location, createdById: users["demo.admin@example.com"].id, sourceName: opportunity.sourceName, canonicalUrl: opportunity.canonicalUrl ?? null, status: "PUBLISHED", moderationStatus: "APPROVED", publishedAt: new Date() },
    });
  }

  const events = [
    { id: "event-fete-liberation-libreville", title: "Fete de la Liberation du 30 Aout - Commemoration Nationale", description: "Commemoration officielle de la Fete de la Liberation du 30 Aout a Libreville, avec ceremonies institutionnelles et rassemblements populaires.", startDate: new Date("2026-08-30T09:00:00"), location: "Libreville, Gabon", sourceName: "Presidence de la Republique Gabonaise", canonicalUrl: null as string | null },
    { id: "event-fete-liberation-paris", title: "Rassemblement de la diaspora - Fete de la Liberation", description: "Rassemblement de la diaspora gabonaise de France a l'occasion de la Fete de la Liberation du 30 Aout.", startDate: new Date("2026-08-30T18:00:00"), location: "Paris, France", sourceName: "Ambassade du Gabon en France", canonicalUrl: "https://www.ambassadedugabon.fr/" as string | null },
    { id: "event-forum-orientation-montreal", title: "Forum d'orientation des etudiants gabonais", description: "Forum d'orientation academique et administrative destine aux nouveaux etudiants gabonais arrivant a Montreal.", startDate: new Date("2026-09-20T10:00:00"), location: "Montreal, Canada", sourceName: "Ambassade du Gabon au Canada", canonicalUrl: "https://ambassadedugabon.ca/" as string | null },
    { id: "event-salon-emploi-diaspora-paris", title: "Salon de l'emploi de la diaspora gabonaise", description: "Salon de l'emploi reunissant recruteurs et candidats de la diaspora gabonaise en France.", startDate: new Date("2026-10-10T09:30:00"), location: "Paris, France", sourceName: "Association des Gabonais de Paris", canonicalUrl: null as string | null },
    { id: "event-rencontre-associative-dakar", title: "Rencontre associative de la diaspora gabonaise", description: "Rencontre des associations de la diaspora gabonaise etablies au Senegal, echanges sur l'entraide communautaire.", startDate: new Date("2026-09-27T15:00:00"), location: "Dakar, Senegal", sourceName: "Ambassade du Gabon au Senegal", canonicalUrl: "https://www.diplomatie.gouv.ga/" as string | null },
  ];
  for (const event of events) {
    const slug = event.id;
    await prisma.event.upsert({
      where: { id: event.id },
      update: { title: event.title, description: event.description, startDate: event.startDate, location: event.location, sourceName: event.sourceName, canonicalUrl: event.canonicalUrl ?? null, status: "PUBLISHED", moderationStatus: "APPROVED", publishedAt: new Date() },
      create: { id: event.id, title: event.title, slug, description: event.description, startDate: event.startDate, location: event.location, organizerType: "USER", createdById: users["demo.admin@example.com"].id, sourceName: event.sourceName, canonicalUrl: event.canonicalUrl ?? null, status: "PUBLISHED", moderationStatus: "APPROVED", publishedAt: new Date() },
    });
  }

  const sourceRegistry = [
    { name: "France 24 Afrique", url: "https://www.france24.com/fr/afrique", type: SourceRegistryType.MEDIA, country: "FR", language: "fr", rssUrl: "https://www.france24.com/fr/afrique/rss", reliability: 4, termsUrl: "https://www.france24.com/fr/mentions-legales", targetAudiences: ["DIASPORA", "CAMPUS"] },
    { name: "RFI Afrique", url: "https://www.rfi.fr/fr/afrique", type: SourceRegistryType.MEDIA, country: "FR", language: "fr", rssUrl: "https://www.rfi.fr/fr/rss", reliability: 4, termsUrl: "https://www.rfi.fr/fr/mentions-legales", targetAudiences: ["DIASPORA", "ADMINISTRATIVE"] },
    { name: "BBC Afrique", url: "https://www.bbc.com/afrique", type: SourceRegistryType.MEDIA, country: "GB", language: "fr", rssUrl: "https://feeds.bbci.co.uk/news/world/africa/rss.xml", reliability: 4, termsUrl: "https://www.bbc.com/usingthebbc/terms", targetAudiences: ["DIASPORA"] },
    { name: "Le Monde Afrique", url: "https://www.lemonde.fr/afrique/", type: SourceRegistryType.MEDIA, country: "FR", language: "fr", rssUrl: "https://www.lemonde.fr/afrique/rss_full.xml", reliability: 4, termsUrl: "https://www.lemonde.fr/mentions-legales/", targetAudiences: ["DIASPORA", "CAMPUS"] },
    { name: "Google News Gabon", url: "https://news.google.com/search?q=Gabon&hl=fr&gl=GA&ceid=GA:fr", type: SourceRegistryType.MEDIA, country: "GA", language: "fr", rssUrl: "https://news.google.com/rss/search?q=Gabon&hl=fr&gl=GA&ceid=GA:fr", reliability: 3, termsUrl: "https://policies.google.com/terms", targetAudiences: ["DIASPORA", "ADMINISTRATIVE"] },
    { name: "Google News Campus France", url: "https://news.google.com/search?q=Campus%20France&hl=fr&gl=FR&ceid=FR:fr", type: SourceRegistryType.UNIVERSITY, country: "FR", language: "fr", rssUrl: "https://news.google.com/rss/search?q=Campus%20France&hl=fr&gl=FR&ceid=FR:fr", reliability: 3, termsUrl: "https://policies.google.com/terms", targetAudiences: ["CAMPUS"] },
  ];
  for (const source of sourceRegistry) {
    await prisma.sourceRegistry.upsert({ where: { url: source.url }, update: source, create: source });
  }

  console.log("Seed terminé : géographie, membres et associations de démonstration créés.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });