# Audit d'architecture V0.2.0

**Task :** 039 — Architecture & Database Audit
**Branche :** `feature/v0.2.0`
**Date :** 2026-08-27
**Statut :** audit sans changement de code runtime

## 1. Perimetre et conclusion

Le schema Prisma V0.1.6 est coherent pour les parcours CRUD actuels et possede deja une base exploitable pour les notifications : `User` est la racine d'identite, les contenus metier ont un proprietaire, et les relations vers `Event`, `Opportunity` et `Article` sont disponibles.

Les notifications et les parcours administratifs ne doivent toutefois pas etre ajoutes comme simples colonnes dans les modules existants. Il faut introduire des modeles dedies, des indexes adaptes aux lectures non lues et une politique d'autorisation testee cote serveur. La table `feedbacks` est hors Prisma, dans Supabase `public`, et doit rester traitee par migration SQL/RLS distincte.

## 2. Etat du schema Prisma

### Modeles existants

- `User`
- `Profile`
- `Continent`
- `Country`
- `City`
- `Association`
- `AssociationMember`
- `Connection`
- `ImportBatch`
- `ImportRecord`
- `Article`
- `Announcement`
- `AnnouncementTarget`
- `Shop`
- `Product`
- `UserConsent`
- `Event`
- `EventParticipant`
- `Opportunity`
- `OpportunityApplication`
- `Post`
- `PostLike`
- `PostComment`
- `Conversation`
- `Message`

### Enums existants pertinents

- `Role` : `USER`, `ADMIN`
- `ProfileVisibility` : `PUBLIC`, `PRIVATE`
- `ArticleStatus` : `DRAFT`, `PUBLISHED`, `ARCHIVED`
- `ArticleCategory` : `GABON`, `INTERNATIONAL`, `DIASPORA`, `STUDENTS`, `CAMPUS`, `OPPORTUNITIES`, `POLITICS`, `ECONOMY`, `CULTURE`, `SPORTS`
- `EventStatus` : `DRAFT`, `PUBLISHED`, `CANCELLED`
- `OpportunityStatus` : `DRAFT`, `PUBLISHED`, `CLOSED`, `ARCHIVED`
- `PostVisibility` : `PUBLIC`, `MEMBERS_ONLY`
- `UserStatus` : `ONLINE`, `AWAY`, `BUSY`, `OFFLINE`, `INCOGNITO`

Il n'existe pas de role Prisma `MEMBER`. Le terme membre correspond aujourd'hui a un utilisateur authentifie de role `USER`, eventuellement muni d'un profil. Il ne faut pas introduire un role `MEMBER` sans migration, matrice d'acces et analyse des dependances.

### Relations utilisables pour les notifications

- `User` → `Profile` : profil utilisateur et visibilite.
- `User` → `Article[]` : auteur d'une actualite via `authorId`.
- `User` → `Event[]` : createur d'un evenement via `createdById`.
- `User` → `Opportunity[]` : createur d'une opportunite via `createdById`.
- `User` → `Post[]` : auteur d'une publication via `authorId`.
- `User` → `Conversation[]` et `Message[]` : messagerie et destinataires indirects.
- `User` → `OpportunityApplication[]` : candidatures.
- `User` → `EventParticipant[]` : participations.
- `User` → `UserConsent[]` : consentements existants pour communications et publicite.
- `Association` → `Event[]`, `Opportunity[]`, `Shop[]`, `Post[]` : sources associatives.
- `City` → `Profile[]`, `Association[]` : geolocalisation des membres et associations.
- `Event` → `EventParticipant[]` : declencheurs de rappel et changements d'evenement.
- `Opportunity` → `OpportunityApplication[]` : declencheurs de candidature et changement de statut.
- `Article` : source de notification editoriale, sans relation inverse de notification actuellement.

`Feedback` n'est pas un modele Prisma. La table `feedbacks` est geree dans Supabase et expose des champs de moderation `status`/`is_published` via migration SQL.

## 3. Schema recommande pour Task 040

### 3.1 Type de notification

```prisma
enum NotificationType {
  NEWS
  EVENT
  OPPORTUNITY
  CAMPUS
  SYSTEM
  MESSAGE
}
```

Le type doit rester un enum stable et generique. Les details specifiques sont portes par le message traduit ou par un evenement metier interne, pas par une proliferation d'enums par ecran.

### 3.2 Modele Notification

```prisma
model Notification {
  id          String           @id @default(cuid())
  userId      String
  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  type        NotificationType
  title       String
  message     String
  link        String?
  isRead      Boolean          @default(false)
  readAt      DateTime?
  sourceType  String?
  sourceId    String?
  createdAt   DateTime         @default(now())

  @@index([userId, isRead, createdAt])
  @@index([userId, createdAt])
  @@index([sourceType, sourceId])
  @@map("notifications")
}
```

#### Decision sur les sources

Prisma ne permet pas une cle etrangere polymorphe unique vers `Article`, `Event`, `Opportunity`, `Campus` et `Message`. Pour Task 040, `sourceType` + `sourceId` est acceptable si :

- `sourceType` est valide par une whitelist serveur (`ARTICLE`, `EVENT`, `OPPORTUNITY`, `CAMPUS`, `MESSAGE`, `SYSTEM`) ;
- la creation passe par un service serveur idempotent ;
- le lien est regenere ou verifie avant affichage ;
- aucun identifiant prive n'est expose a un autre utilisateur.

Alternative recommandee si les exigences d'integrite referentielle deviennent fortes : tables de jonction ou colonnes FK nullablees par source (`articleId`, `eventId`, `opportunityId`, `messageId`) avec contraintes et indexes. Cette option est plus verifiable en base mais plus lourde et moins adaptee aux futures sources Campus.

`title` et `message` peuvent contenir un rendu prepare, mais le contrat ideal pour les notifications generees automatiquement est un `templateKey` + payload valide cote serveur. La traduction est ainsi resolue dans la locale de l'utilisateur au rendu.

### 3.3 Preferences de notification

Version minimale conforme au besoin :

```prisma
model NotificationPreference {
  id                 String   @id @default(cuid())
  userId             String   @unique
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  emailNotifications Boolean  @default(true)
  pushNotifications  Boolean  @default(false)
  inAppNotifications Boolean  @default(true)
  allowedTypes       Json
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@map("notification_preferences")
}
```

`allowedTypes` doit etre valide contre `NotificationType[]` en Zod et ne doit jamais etre accepte directement depuis des claims utilisateur. Option plus normalisee pour les requetes et contraintes :

```prisma
model NotificationPreferenceType {
  id           String           @id @default(cuid())
  preferenceId String
  preference   NotificationPreference @relation(fields: [preferenceId], references: [id], onDelete: Cascade)
  type         NotificationType

  @@unique([preferenceId, type])
  @@index([type])
  @@map("notification_preference_types")
}
```

La seconde option est preferable si les preferences doivent etre filtrees ou administrees analytiquement. Dans les deux cas, une ligne de preference est creee par defaut a l'inscription ou lazy-load avec des valeurs explicites.

### 3.4 Relations a ajouter a User

```prisma
notifications           Notification[]
notificationPreference  NotificationPreference?
```

Ces relations ne doivent etre ajoutees qu'avec la migration correspondante et regeneration du client Prisma.

## 4. Extensions recommandees pour Task 042

Les parcours administratifs doivent etre modelises comme contenu editorial versionne, et non comme texte en dur dans les pages.

```prisma
enum AdministrativeServiceType {
  PASSPORT
  CONSULATE
  VISA
  CONSULAR_CARD
  INTEGRATION
  RETURN_TO_GABON
}

enum AdministrativeStepStatus {
  TODO
  IN_PROGRESS
  COMPLETED
}

model AdministrativeService {
  id             String                   @id @default(cuid())
  slug           String                   @unique
  type           AdministrativeServiceType
  title          String
  description    String
  officialUrl    String?
  sourceName     String?
  sourceVerifiedAt DateTime?
  isPublished    Boolean                  @default(false)
  version        Int                      @default(1)
  createdAt      DateTime                 @default(now())
  updatedAt      DateTime                 @updatedAt
  steps          AdministrativeStep[]

  @@index([type, isPublished])
  @@map("administrative_services")
}

model AdministrativeStep {
  id          String                @id @default(cuid())
  serviceId   String
  service     AdministrativeService @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  position    Int
  title       String
  description String
  documents   Json
  createdAt   DateTime              @default(now())
  updatedAt   DateTime              @updatedAt

  @@unique([serviceId, position])
  @@map("administrative_steps")
}

model UserAdministrativeProgress {
  id          String                  @id @default(cuid())
  userId      String
  stepId      String
  status      AdministrativeStepStatus @default(TODO)
  completedAt DateTime?
  createdAt   DateTime                @default(now())
  updatedAt   DateTime                @updatedAt

  @@unique([userId, stepId])
  @@index([userId, status])
  @@map("user_administrative_progress")
}
```

Le champ `documents` doit etre un payload structure valide, avec URLs officielles et type de document. Les documents telecharges par un utilisateur ne doivent pas etre melanges avec les instructions publiques ; un futur module de stockage devra avoir ses propres policies.

## 5. Audit des acces et de l'authentification

### Etat constate

- La session est lue via Supabase SSR avec `auth.getUser()` et cookies serveur.
- `ensureUser()` synchronise l'identite dans Prisma par `upsert`.
- Les actions d'administration existantes appellent `ensureUser()` puis `isAdminRole(user.role)`.
- `Role.ADMIN` est stocke dans Prisma et n'est pas derive de `user_metadata` Supabase.
- La cle `SUPABASE_SERVICE_ROLE_KEY` est reservee aux actions serveur de moderation feedback.
- La session Supabase et le role Prisma sont deux controles distincts : une session valide ne suffit pas a obtenir des droits admin.

### Exigences pour notifications

1. Une notification appartient toujours a un `userId` et ne peut etre lue, marquee ou supprimee que par ce proprietaire.
2. Une emission globale est une operation admin serveur, avec input valide et journalisation ; elle ne doit jamais etre exposee a un client anonyme.
3. Une notification creee pour une candidature, un message ou un evenement doit verifier que le destinataire pouvait deja voir la ressource.
4. Les liens profonds doivent repasser par l'autorisation de la page cible.
5. Les preferences email/push ne remplacent pas le consentement `UserConsent` ; il faut definir la precedence et le retrait.
6. Les taches asynchrones devront etre idempotentes pour eviter les doublons.

### RLS et Supabase

Les tables Prisma sont servies par la connexion PostgreSQL de l'application et ne disposent pas, dans ce depot, d'un jeu de policies Supabase equivalent. La table `feedbacks`, elle, a RLS active :

- lecture `anon`/`authenticated` uniquement si `is_published = true` et `status = 'published'` ;
- insertion publique uniquement si `status = 'pending'` et `is_published = false` ;
- moderation effectuee via le service serveur, jamais avec la cle anon.

Pour une future table exposee via Supabase Data API, activer RLS avant exposition et creer une policy proprietaire explicite. `TO authenticated` seul ne constitue pas une autorisation suffisante. Les decisions de role doivent rester cote serveur ou dans `raw_app_meta_data`, jamais dans `raw_user_meta_data` modifiable par l'utilisateur.

## 6. I18n, cache et observabilite

- Stocker un `templateKey` et des variables plutot qu'une phrase monolingue pour les notifications systeme.
- Resoudre la locale depuis la preference persistante et prevoir FR par defaut.
- Traduire les statuts, empty states, erreurs serveur, emails et contenus d'onboarding.
- Ne jamais mettre en cache une notification privee dans un cache partage.
- Indexer `(userId, isRead, createdAt)` pour le compteur et la liste non lus.
- Ajouter une retention et une strategie d'archivage avant d'emettre des notifications a grande echelle.
- Journaliser les erreurs d'emission sans loguer le contenu prive ou les tokens.

## 7. Plan de validation Task 040

Avant merge :

1. Migration appliquee sur staging et rollback documente.
2. `npx prisma validate`.
3. `npx tsc --noEmit`.
4. `npm run lint`.
5. `npm run build`.
6. Tests de lecture par proprietaire, compteur non lu, marquage lu, preferences, idempotence et acces admin.
7. Verification FR/EN des templates, variables manquantes, longueurs mobiles et emails.
8. Revue RLS/policies si la table est exposee par Supabase Data API.

## 8. Decisions et risques a traiter avant implementation

- **Source polymorphe :** choisir `sourceType/sourceId` controle par service ou FKs explicites avant la migration Task 040.
- **Role MEMBER :** ne pas l'ajouter par analogie ; definir d'abord la matrice USER/MEMBER/ADMIN et la migration des utilisateurs existants.
- **Email et push :** le schema de preference doit etre coordonne avec `UserConsent` et le fournisseur de notification.
- **RLS Prisma :** decider si les tables notifications restent exclusivement derriere Prisma ou sont exposees par Supabase Data API ; les policies different.
- **Feedback :** maintenir les migrations Supabase separees du schema Prisma et documenter leur deploiement.
- **Parcours administratifs :** nommer un responsable editorial des sources et une date de verification pour eviter des informations perimees.

## Verdict

Le socle V0.1.6 est apte a recevoir Task 040 et Task 042, sous reserve de traiter les decisions ci-dessus avant migration. La recommandation prioritaire est de commencer par `Notification` + `NotificationPreference` avec ownership strict, indexes de lecture non lue, templates i18n et tests d'autorisation ; les parcours administratifs peuvent ensuite reutiliser la meme approche de contenu versionne et de progression par utilisateur.
