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
import { PrismaClient, ProfileVisibility, AssociationStatus, Role, AdministrativeProcedureCategory } from "../app/generated/prisma";

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

  const procedures = [
    {
      slug: "passeport-renouvellement",
      title: "Renouvellement du passeport gabonais",
      description: "Preparez votre dossier et suivez les etapes de renouvellement de votre passeport.",
      category: AdministrativeProcedureCategory.CONSULAR,
      estimatedDays: 30,
      cost: "Selon le tarif du consulat",
      officialUrl: "https://www.diplomatie.gouv.ga/",
      steps: [
        ["Verifier les conditions", "Confirmez la procedure aupres de votre consulat.", true],
        ["Rassembler les pieces", "Preparez votre ancien passeport, vos photos et les justificatifs demandes.", true],
        ["Prendre rendez-vous", "Utilisez le portail officiel ou contactez votre representation consulaire.", true],
        ["Deposer le dossier", "Presentez les originaux et reglez les frais applicables.", true],
        ["Retirer le passeport", "Suivez la notification du consulat pour le retrait.", true],
      ],
    },
    {
      slug: "immatriculation-consulaire",
      title: "Inscription consulaire",
      description: "Inscrivez-vous aupres de votre consulat pour faciliter vos demarches a l'etranger.",
      category: AdministrativeProcedureCategory.CONSULAR,
      estimatedDays: 7,
      cost: "Gratuit ou selon le consulat",
      officialUrl: "https://www.diplomatie.gouv.ga/",
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
      steps: [
        ["Verifier l'organisme demandeur", "Confirmez le format et la periode attendus par votre etablissement.", true],
        ["Preparer votre dossier", "Rassemblez votre identite, votre inscription et les justificatifs de scolarite.", true],
        ["Soumettre la demande", "Transmettez le dossier au service DGBC ou Campus indique.", true],
        ["Archiver l'attestation", "Conservez le document et verifiez sa date de validite.", true],
      ],
    },
  ] as const;

  for (const procedureData of procedures) {
    const procedure = await prisma.administrativeProcedure.upsert({
      where: { slug: procedureData.slug },
      update: { title: procedureData.title, description: procedureData.description, category: procedureData.category, estimatedDays: procedureData.estimatedDays, cost: procedureData.cost, officialUrl: procedureData.officialUrl },
      create: { slug: procedureData.slug, title: procedureData.title, description: procedureData.description, category: procedureData.category, estimatedDays: procedureData.estimatedDays, cost: procedureData.cost, officialUrl: procedureData.officialUrl },
    });
    for (const [index, [title, description, isRequired]] of procedureData.steps.entries()) {
      await prisma.procedureStep.upsert({ where: { procedureId_order: { procedureId: procedure.id, order: index + 1 } }, update: { title, description, isRequired }, create: { procedureId: procedure.id, order: index + 1, title, description, isRequired } });
    }
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