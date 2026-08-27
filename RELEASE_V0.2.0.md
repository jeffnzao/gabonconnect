# GabonConnect V0.2.0

GabonConnect V0.2.0 fait évoluer la plateforme en hub communautaire, informatif et pratique pour la diaspora gabonaise.

## Piliers livrés

### Pilier 1 — Notification Center

- Centre de notifications in-app intégré au Header.
- Badge dynamique du nombre de notifications non lues.
- Lecture individuelle et marquage global comme lu.
- Préférences utilisateur persistées pour les canaux In-App, Email et Push.
- Émission intelligente inter-modules pour News, Campus, Opportunities et Events.

### Pilier 2 — Services Administratifs 2.0

- Parcours guidés pour les démarches administratives.
- Checklists interactives avec sauvegarde de progression.
- Suivi des statuts `NOT_STARTED`, `IN_PROGRESS` et `COMPLETED`.
- Procédures seedées pour passeport, inscription consulaire, état civil et attestation DGBC/Campus.
- Liens vers les sources officielles et informations de délai/coût.

### Pilier 3 — Campus 2.0

- Annuaire des bourses DGBC et Campus France.
- Filtres par pays, niveau d’études et organisme.
- Offres de logements et colocations publiables par les membres authentifiés.
- Recherche par ville, pays et type de logement.
- Guide d’intégration et conseils d’arrivée pour les étudiants.

### Pilier 4 — Opportunities 2.0

- Candidatures en ligne avec lettre de motivation et lien CV.
- Détection des candidatures en doublon.
- Favoris d’opportunités avec contrainte d’unicité par utilisateur.
- Espace candidat pour les candidatures envoyées.
- Espace recruteur pour les candidatures reçues et leur statut.

### Pilier 5 — Communauté & Diplomatic Directory

- Associations 2.0 avec catégories, vérification, leadership et demandes d’adhésion.
- Gestion des statuts membres par les administrateurs autorisés.
- Bottin des ambassades et consulats du Gabon.
- Contacts, adresses, horaires, juridictions, coordonnées et liens vers les démarches.
- Données initiales pour la France, le Canada, les États-Unis, la Chine, le Maroc et le Sénégal.

## Core & Mobile

- Deep-linking messagerie par `conversationId`, `userId` et `recipientId`.
- Gestion robuste des conversations absentes, sessions invalides et tables indisponibles.
- Recherche globale multi-domaines avec palette `Cmd+K` / `Ctrl+K`.
- Résultats groupés pour membres, associations, événements, opportunités, démarches et consulats.
- Sitemap dynamique et metadata SEO/Open Graph localisées.
- PWA en mode `standalone` avec manifest, icônes adaptatives et service worker.
- Cache offline pour les routes critiques et page de secours hors connexion.
- Bannière de détection réseau sur mobile et desktop.

## Qualité et validation

- Parité stricte des dictionnaires FR/EN.
- Contrôles de session, ownership, rôles et validations serveur sur les mutations sensibles.
- Migrations Prisma et Supabase documentées par domaine.
- Validation finale :
  - `npx prisma validate`
  - `npx tsc --noEmit`
  - `npm run lint`
  - `npm run build`

## Version

La version du projet est `0.2.0` dans `package.json`. Les fonctionnalités nécessitant une base de données doivent être déployées avec les migrations correspondantes et les variables d’environnement documentées dans `.env.example`.
