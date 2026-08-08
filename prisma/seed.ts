// Seed de démonstration GabonConnect.
// Toutes les données ci-dessous sont FICTIVES : aucune personne réelle,
// aucun email réel, aucune donnée personnelle réelle n'est utilisée.
//
// Note sur User.id : en production, cet id provient de Supabase Auth
// (auth.users.id). Comme ce seed ne crée pas de vrais comptes Supabase,
// on génère des UUID aléatoires pour simuler des comptes de démonstration.

import { randomUUID } from "node:crypto";
import { PrismaClient, ProfileVisibility, AssociationStatus, Role } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── 1. CONTINENTS ──────────────────────────────────────────────
  const continentsData = [
    { name: "Afrique", slug: "afrique", code: "AF" },
    { name: "Europe", slug: "europe", code: "EU" },
    { name: "Amérique du Nord", slug: "amerique-du-nord", code: "NA" },
    { name: "Amérique du Sud", slug: "amerique-du-sud", code: "SA" },
    { name: "Asie", slug: "asie", code: "AS" },
    { name: "Océanie", slug: "oceanie", code: "OC" },
  ];

  const continents: Record<string, { id: string }> = {};
  for (const c of continentsData) {
    const created = await prisma.continent.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    continents[c.slug] = created;
  }

  // ── 2. PAYS ─────────────────────────────────────────────────────
  const countriesData = [
    { name: "Gabon", slug: "gabon", code: "GA", continent: "afrique" },
    { name: "Sénégal", slug: "senegal", code: "SN", continent: "afrique" },
    { name: "Côte d'Ivoire", slug: "cote-d-ivoire", code: "CI", continent: "afrique" },
    { name: "Maroc", slug: "maroc", code: "MA", continent: "afrique" },
    { name: "France", slug: "france", code: "FR", continent: "europe" },
    { name: "Belgique", slug: "belgique", code: "BE", continent: "europe" },
    { name: "Royaume-Uni", slug: "royaume-uni", code: "GB", continent: "europe" },
    { name: "Allemagne", slug: "allemagne", code: "DE", continent: "europe" },
    { name: "Canada", slug: "canada", code: "CA", continent: "amerique-du-nord" },
    { name: "États-Unis", slug: "etats-unis", code: "US", continent: "amerique-du-nord" },
  ];

  const countries: Record<string, { id: string }> = {};
  for (const c of countriesData) {
    const created = await prisma.country.upsert({
      where: { slug: c.slug },
      update: {},
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