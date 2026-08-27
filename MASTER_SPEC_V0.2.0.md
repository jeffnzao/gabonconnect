# GabonConnect V0.2.0
## Product & Technical Master Specification

**Statut :** cadrage de version
**Branche :** `feature/v0.2.0`
**Version precedente :** V0.1.6
**Locales cibles :** francais par defaut, anglais disponible

## 1. Vision

GabonConnect V0.2.0 transforme la plateforme en espace de service, d'information et d'opportunites pour la diaspora gabonaise. Chaque experience doit etre utile, compréhensible et actionnable sur mobile comme sur desktop.

### Objectifs de version

- Informer au bon moment avec des notifications pertinentes.
- Guider les usagers dans leurs demarches administratives.
- Donner aux etudiants des ressources fiables pour reussir a l'etranger.
- Faciliter les mises en relation, candidatures et engagements.
- Structurer les organisations, professionnels et commerces verifies.
- Preparer une base technique progressive pour la monetisation et le mobile offline.

### Principes non negociables

1. **Clarte avant densite** : chaque ecran expose une action principale explicite.
2. **Mobile first** : les parcours critiques sont utilisables au clavier et au toucher.
3. **Confiance** : provenance des informations, statut de verification et date de mise a jour visibles.
4. **Privacy by design** : minimisation des donnees, consentement et acces par role.
5. **FR/EN parite stricte** : aucune interface ou erreur utilisateur dans une seule langue.
6. **Progressivite** : migrations reversibles, compatibilite avec les donnees V0.1.6 et rollout controle.

## 2. Les cinq piliers strategiques

### Pilier 1 — Etre informe

Centre de notifications in-app, compteurs non lus, preferences par type, notifications liees aux modules et relais email optionnels. L'utilisateur doit pouvoir comprendre pourquoi il recoit une notification, la marquer comme lue et controler ses preferences.

### Pilier 2 — Etre accompagne

Parcours administratifs guides et checklists interactives pour passeport, consulat, visas, cartes consulaires, integration et retour au Gabon. Chaque parcours distingue les informations officielles, les documents requis, les etapes, les liens externes et la date de verification.

### Pilier 3 — Reussir a l'etranger — Campus 2.0

Espace etudiants pour bourses (notamment Campus France et DGBC), logements, aides, opportunites academiques, calendrier et entraide. Les sources, echeances et conditions d'eligibilite doivent etre identifiables.

### Pilier 4 — Creer des opportunites

Interconnexion Diaspora ↔ Gabon, matching selon competences et besoins, candidatures, benevolat, recrutement et alertes. Les recommandations restent explicables et l'utilisateur garde le controle de sa visibilite.

### Pilier 5 — Economie de la communaute

Preparation de profils Organisations, Pros, commerces et associations, comptes verifies, offres professionnelles et cotisations. La monetisation est introduite apres validation de la confiance, de la facturation et du support.

## 3. Decoupage des Tasks 039 a 048

### TASK 039 — Audit d'Architecture V0.2.0

**Perimetre :** inventaire des models, relations, RLS, roles, Server Actions, APIs, cache, i18n et conventions de migration.

**Prerequis :** schema V0.1.6 valide, environnement de staging, matrice des roles (`USER`, `ADMIN`) et cartographie des donnees personnelles.

**I18n FR/EN :** recenser les namespaces existants, supprimer les textes en dur, definir les conventions de pluriels, dates, nombres, erreurs et contenus venant de sources externes.

**Securite :** revue des controles serveur, validation Zod des entrees, politiques RLS par table, autorisation basee sur `app_metadata`/role serveur et verification de l'absence de secrets cote client.

**Validation :** `npx prisma validate` → `npx tsc --noEmit` → `npm run lint` → `npm run build`, plus revue des migrations et tests des controles d'acces.

### TASK 040 — Notification Center

**Perimetre :** modeles de notifications, centre in-app, compteurs et statuts lu/non lu, pagination et marquage individuel ou global.

**Prerequis :** audit Task 039, identite utilisateur stable, strategie d'indexation et contrat d'evenement interne.

**I18n FR/EN :** types de notification traduits, variables interpolées, dates localisees, et fallback pour une notification dont le contenu source a ete retire.

**Securite :** chaque utilisateur ne lit et ne modifie que ses notifications ; mutations protegees par session et proprietaire ; ADMIN ne contourne pas les donnees privees sans besoin explicite.

**Validation :** migrations et `npx prisma validate` → `npx tsc --noEmit` → `npm run lint` → `npm run build`, tests de pagination, non-lu et isolation utilisateur.

### TASK 041 — Notifications Intelligentes Inter-modules

**Perimetre :** declencheurs pour Events, Opportunities, News et Campus, preferences, deduplication, frequence et liens profonds.

**Prerequis :** Task 040, catalogue d'evenements metier, idempotence et politique anti-spam.

**I18n FR/EN :** templates versionnes par locale, variables obligatoires validees, fallback FR et formatage localise des dates/echeances.

**Securite :** ne jamais reveler une ressource privee dans un apercu ; verifier les permissions au clic ; proteger les endpoints contre la repetition et l'injection de contenu.

**Validation :** `npx prisma validate` → `npx tsc --noEmit` → `npm run lint` → `npm run build`, tests de declenchement, deduplication, preferences et autorisation.

### TASK 042 — Services Administratifs 2.0 & Parcours Guides

**Perimetre :** checklists, documents officiels, etapes, statut de progression, liens source et rappels facultatifs.

**Prerequis :** inventaire valide des services, responsables editoriaux, dates de revision et modele de document/etape.

**I18n FR/EN :** chaque parcours, etape, erreur, aide et statut disponible dans les deux langues ; les citations et noms officiels ne sont pas traduits abusivement.

**Securite :** validation des URLs, moderation des contenus editoriaux, acces utilisateur a ses progres uniquement et droits ADMIN separes de l'edition publique.

**Validation :** `npx prisma validate` → `npx tsc --noEmit` → `npm run lint` → `npm run build`, tests de progression, reprise, suppression et permissions.

### TASK 043 — GabonConnect Campus 2.0

**Perimetre :** bourses, logements, aides, opportunites academiques, entraide, filtres, echeances et sources.

**Prerequis :** taxonomy Campus, workflow editorial, schema d'echeance, moderation et import de sources fiables.

**I18n FR/EN :** categories, conditions, dates, montants, statuts, formulaires et etats vides paritaires ; respect des formats locaux pour dates et devises.

**Securite :** moderation obligatoire avant publication, controle des liens externes, protection des messages et limitation des donnees etudiantes sensibles.

**Validation :** `npx prisma validate` → `npx tsc --noEmit` → `npm run lint` → `npm run build`, tests de recherche, echeance, publication et visibilite.

### TASK 044 — Opportunities & Matching System 2.0

**Perimetre :** profils de competences, candidatures, matching explicable, alertes, benevolat et recrutement.

**Prerequis :** modele de profil enrichi, consentements de visibilite, taxonomie de competences et lifecycle de candidature.

**I18n FR/EN :** etats de candidature, raisons de matching, messages d'alerte, formulaires et erreurs traduits ; les termes de competences conservent des identifiants stables.

**Securite :** cloisonnement candidat/recruteur, anti-enumeration, consentement explicite, RLS sur candidatures et audit des changements de statut.

**Validation :** `npx prisma validate` → `npx tsc --noEmit` → `npm run lint` → `npm run build`, tests d'equite de matching, isolation, retrait de consentement et candidature.

### TASK 045 — Profils Organisations, Commerces & Associations Pros

**Perimetre :** profils professionnels, pages organisation, catalogues, contacts, membres autorises et verification.

**Prerequis :** ownership existant, workflow de verification, documents justificatifs et regles de fusion/deduplication.

**I18n FR/EN :** labels de profil, secteurs, statuts, formulaires, messages de verification et pages publiques traduits ; les noms propres restent ceux fournis par le proprietaire.

**Securite :** RBAC proprietaire/editeur/ADMIN, RLS, verification des domaines et contacts, anti-abus et journalisation des actions sensibles.

**Validation :** `npx prisma validate` → `npx tsc --noEmit` → `npm run lint` → `npm run build`, tests ownership, verification, publication et suppression.

### TASK 046 — Architecture de Monetisation & Comptes Verifies

**Perimetre :** niveaux de compte, avantages, cotisations, facturation, verification et support, sans activation prematuree des paiements.

**Prerequis :** decision business, fournisseur de paiement, exigences legales, reconciliation, gestion des remboursements et environnement sandbox.

**I18n FR/EN :** prix, taxes, factures, statuts de paiement, emails, erreurs et consentements localises ; montants et devises formates selon locale.

**Securite :** aucun secret de paiement dans le client, webhooks signes et idempotents, separation des privileges financiers, minimisation PCI et audit trail.

**Validation :** `npx prisma validate` → `npx tsc --noEmit` → `npm run lint` → `npm run build`, tests sandbox de paiement, webhook, remboursement et controle d'acces.

### TASK 047 — PWA, Support Mobile & Cache Offline

**Perimetre :** manifest, installation, cache des assets, fallback offline et synchronisation prudente des actions.

**Prerequis :** budget cache, matrice navigateurs, strategie de versionnement, parcours offline autorises et politique de donnees locales.

**I18n FR/EN :** nom, description, prompts d'installation, offline fallback, erreurs de synchronisation et dates traduits ; la locale persiste hors connexion.

**Securite :** ne jamais mettre en cache des donnees sensibles sans chiffrement et consentement ; invalider les sessions, proteger les mutations rejouees et controler les origines.

**Validation :** `npx prisma validate` → `npx tsc --noEmit` → `npm run lint` → `npm run build`, audit Lighthouse, tests offline/online, cache stale et migration de version.

### TASK 048 — Audit Performance, Core Web Vitals, SEO & Accessibilite

**Perimetre :** performance serveur/client, images, bundle, Core Web Vitals, metadata, crawl, clavier, lecteur d'ecran et contrastes.

**Prerequis :** parcours critiques definis, budgets de performance, appareils de reference et scripts d'audit reproductibles.

**I18n FR/EN :** metadata, titres, descriptions, erreurs, alt text et annonces ARIA paritaires ; tests des longueurs de texte et de la langue HTML.

**Securite :** revue des headers, CSP, liens externes, exposition de metadata, dependances et absence de donnees privees dans HTML/cache.

**Validation :** `npx prisma validate` → `npx tsc --noEmit` → `npm run lint` → `npm run build`, Lighthouse mobile/desktop, tests clavier/axe, budget bundle et audit SEO.

## 4. Gouvernance et Definition of Done

Une Task est livrable lorsque :

- son schema/migration est documente et reversible ;
- ses Server Actions et APIs valident session, role, ownership et entrees ;
- les tests couvrent succes, erreur, vide, permissions et regression ;
- FR et EN ont les memes cles et des textes relus ;
- le rendu mobile, clavier et lecteur d'ecran est verifie ;
- la chaine `PRISMA VALIDATE → TSC → LINT → BUILD` est verte ;
- la documentation et les variables d'environnement sont mises a jour ;
- aucune cle, donnee personnelle ou sortie de debug n'est committee.

## 5. Strategie de livraison

Les Tasks sont livrees dans l'ordre 039 → 048 avec une PR par unite coherent. Les migrations sont deployees d'abord sur staging, les fonctionnalites sont activees progressivement par configuration, et chaque rollback doit etre documente avant mise en production. Les changements a risque (notifications massives, matching, paiements et offline) exigent un test de charge ou sandbox adapte et une validation produit explicite.
