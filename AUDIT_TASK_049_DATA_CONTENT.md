# GabonConnect V0.2.1
## Task 049 - Content/Data Audit & Product Specifications

**Statut :** specification de preparation
**Branche :** `feature/v0.2.1-data-foundation`
**Scope :** audit et cadrage uniquement, aucun code runtime ou schema modifie
**Version cible :** Data & Content Foundation
**Locales :** FR par defaut, EN disponible

## 1. Resume executif

GabonConnect dispose d'un socle de contenu interne exploitable pour les News, Events, Opportunities, Shops, Campus, Demarches et Associations. Les modules savent publier, rechercher ou afficher des donnees gerees par des utilisateurs et des administrateurs.

Le socle n'est pas encore pret pour une aggregation externe fiable. Il manque une notion explicite de source, d'auteur original, de canonical URL, de provenance, de date de collecte, de deduplication, de moderation editoriale et de droits de reutilisation. La V0.2.1 doit donc separer clairement :

1. le contenu original produit dans GabonConnect ;
2. le contenu externe reference et resume sans copie ;
3. les donnees officielles de service, dont l'exactitude et la date de verification sont critiques.

Decision de principe : aucun article externe ne doit etre reproduit integralement. GabonConnect stocke uniquement le titre, un court resume editorial, la source, la date, la categorie et l'URL canonique, avec un appel explicite **Read original article**.

## 2. Audit de l'existant : etat et besoins

### 2.1 News / Article

**Etat actuel**

- `Article` : `id`, `authorId`, `title`, `slug`, `summary`, `content`, `imageUrl`, `category`, `viewCount`, `status`, `publishedAt`, dates techniques.
- Categories actuelles : `GABON`, `INTERNATIONAL`, `DIASPORA`, `STUDENTS`, `CAMPUS`, `OPPORTUNITIES`, `POLITICS`, `ECONOMY`, `CULTURE`, `SPORTS`.
- Publication manuelle par un utilisateur authentifie ; statut `DRAFT`, `PUBLISHED`, `ARCHIVED`.
- Rendu public via les articles publies et la page News Hub.

**Besoins aggregation**

- `sourceRegistryId`, `externalId`, `canonicalUrl`, `originalAuthor`, `originalPublishedAt`.
- `contentOrigin` : `ORIGINAL`, `AGGREGATED`, `OFFICIAL`.
- `moderationStatus` et `moderationReason` distincts du statut de publication.
- `copyrightStatus`, `termsUrl`, `attributionRequired`, `retrievedAt`.
- `normalizedHash` pour deduplication et `lastClassifiedAt` pour le pipeline.
- Pour une source externe : `content` doit rester vide ou absent ; `summary` doit rester court et editorialement derive.

### 2.2 Events

**Etat actuel**

- `Event` : titre, slug, description, dates, lieu, virtualite, organisateur, association/user owner, capacite, statut et participants.
- Les pages publiques filtrent les evenements publies et a venir.

**Besoins aggregation**

- Distinguer evenement cree par GabonConnect et evenement reference depuis une source externe.
- Ajouter source, URL canonique, date de derniere verification et contact officiel.
- Definir une regle de fusion pour les doublons partageant lieu/date/titre.
- Refuser la publication automatique si la date est passee, si l'URL est invalide ou si la source n'est plus active.
- Prevoir `isCancelled` ou un statut de retrait source sans perdre la trace de la collecte.

### 2.3 Opportunities

**Etat actuel**

- `Opportunity` : titre, description, type (`JOB`, `INTERNSHIP`, `VOLUNTEERING`, `PROJECT_CALL`, `MUTUAL_AID`), lieu, remote, organisation, URL de candidature, contact, association, createur et statut.
- `OpportunityApplication` gere les candidatures internes et `SavedOpportunity` les favoris.

**Besoins aggregation**

- Ajouter source, canonical URL, identifiant externe, auteur/organisation originale et date de publication source.
- Distinguer opportunite externe referencee et opportunite dont la candidature est geree dans GabonConnect.
- Ajouter date d'expiration et `lastVerifiedAt` pour eviter les offres perimees.
- Bloquer toute republication du texte integral, CV ou formulaire provenant d'une source tierce.
- Conserver uniquement les metadonnees necessaires et rediriger vers le site original.

### 2.4 Shops / Product

**Etat actuel**

- `Shop` appartient a un utilisateur, peut etre rattache a une association et possede un statut.
- `Product` possede nom, description, image, prix et statut.
- Le module est un catalogue communautaire, pas un agrégateur externe.

**Besoins aggregation**

- Si des commerces externes sont references, ajouter `sourceRegistryId`, canonical URL, owner verification et consentement de republication.
- Distinguer prix/source/date de mise a jour ; ne pas importer une fiche commerciale sans autorisation.
- Ajouter un workflow `PENDING_REVIEW` avant toute fiche provenant d'un partenaire.
- Tracer l'auteur de chaque modification et l'action de retrait.

### 2.5 Campus

**Etat actuel**

- `Scholarship` : titre, provider, pays, niveau (`LICENCE`, `MASTER`, `DOCTORAT`), description, criteres, deadline et URL de candidature.
- `HousingOffer` : auteur, ville/pays, type, prix, description, contact, disponibilite et date.
- Les offres de logement sont publiees par des utilisateurs authentifies.

**Besoins aggregation**

- `Scholarship` est le premier candidat a l'aggregation officielle : ajouter source, canonical URL, identifiant externe, date de verification et statut editorial.
- Ajouter une distinction `OFFICIAL`, `COMMUNITY`, `AGGREGATED` pour ne pas donner le meme niveau de confiance a une annonce DGBC et a une offre utilisateur.
- Pour les logements, ne jamais importer de donnees personnelles ou de contacts sans consentement ; conserver la moderation et l'ownership utilisateur.
- Ajouter une expiration obligatoire pour les deadlines et disponibilites.

### 2.6 Demarches administratives

**Etat actuel**

- `AdministrativeProcedure` : slug, titre, description, categorie, delai, cout, URL officielle et etapes.
- `ProcedureStep` : ordre, titre, description, caractere obligatoire.
- `UserProcedureProgress` suit la progression personnelle.

**Besoins aggregation**

- Les demarches officielles doivent avoir `sourceRegistryId`, `officialUrl`, `lastVerifiedAt`, `version` et responsable editorial.
- Les liens doivent etre valides et ouvrir le site officiel ; aucune instruction juridique non verifiee ne doit etre auto-publiee.
- Une modification source doit creer une nouvelle version ou un changement auditable, pas ecraser silencieusement l'historique.
- Les pieces et documents doivent rester des references, jamais des copies de documents personnels dans le pipeline public.

### 2.7 Associations

**Etat actuel**

- `Association` : nom, slug, logo, description, contacts, categorie, ville/pays indirects via `City`, verification et president optionnel.
- `AssociationMember` gere le lien profil/utilisateur, role, statut et date d'adhesion.
- Les associations approuvees sont visibles publiquement ; l'adhesion passe par une demande.

**Besoins aggregation**

- Ajouter provenance et consentement pour les associations importees depuis un annuaire tiers.
- Prevoir `externalId`, canonical URL, date de verification et methode de verification.
- Ne pas creer automatiquement un compte utilisateur pour un president ou un contact externe.
- Les fiches importees doivent rester en moderation jusqu'a confirmation ou reclamation par l'organisation.

## 3. Taxonomie editoriale canonique

Les categories externes et internes sont normalisees vers exactement les tags suivants :

| Identifiant | Libelle FR | Usage |
|---|---|---|
| `GABON` | Gabon | Actualites nationales et institutions gabonaises |
| `INTERNATIONAL` | International | Gabon et monde |
| `CAMPUS` | Campus | Etudes, bourses, logement et orientation |
| `OPPORTUNITIES` | Opportunites | Emploi, stage, projets et benevolat |
| `ADMINISTRATIVE` | Administratif | Consulat, passeport, visa, etat civil et integration |
| `CULTURE` | Culture | Arts, patrimoine et creation |
| `SPORT` | Sport | Sports et competitions |
| `DIASPORA` | Diaspora | Vie des communautes a l'etranger |

Les identifiants sont stables et independants des libelles traduits. Un contenu peut avoir une categorie principale et des tags secondaires ; les tags ne doivent pas servir de contournement de moderation.

## 4. Modele Prisma recommande : SourceRegistry

Le modele suivant est la specification cible. Il ne doit etre implemente qu'apres validation du schema, des politiques de retention et du contrat de collecte.

```prisma
enum SourceRegistryType {
  RSS
  API
  WEBSITE
  OFFICIAL_PORTAL
  PARTNER_FEED
}

enum SourceRegistryLanguage {
  FR
  EN
  MULTILINGUAL
}

model SourceRegistry {
  id              String                @id @default(cuid())
  name            String
  url             String                @unique
  type            SourceRegistryType
  country         String?
  language        SourceRegistryLanguage
  rssUrl          String?
  active          Boolean               @default(true)
  reliabilityScore Decimal              @default(0.5) @db.Decimal(3, 2)
  lastFetchedAt   DateTime?
  termsUrl        String?
  createdAt       DateTime              @default(now())
  updatedAt       DateTime              @updatedAt

  @@index([active, type])
  @@index([country, language])
  @@index([lastFetchedAt])
  @@map("source_registry")
}
```

### Contraintes complementaires

- `url`, `rssUrl` et `termsUrl` doivent etre des URLs HTTPS validees par Zod et normalisees.
- `reliabilityScore` est compris entre `0.00` et `1.00`, avec contrainte SQL a ajouter lors de l'implementation.
- `active = false` bloque les nouvelles collectes mais conserve l'historique.
- `lastFetchedAt` est mis a jour uniquement apres un fetch termine et journalise.
- `country` accepte un code ISO normalise ou une valeur `GLOBAL`, jamais un libelle libre non documente.
- La langue de la source n'est pas une promesse de traduction du contenu ; elle guide la classification et l'affichage de l'attribution.

### Extensions de contenu recommandées

Ces champs sont a ajouter aux models agregables lors d'une Task d'implementation distincte :

```prisma
enum ContentOrigin {
  ORIGINAL
  AGGREGATED
  OFFICIAL
}

enum ContentModerationStatus {
  DRAFT
  PENDING_REVIEW
  APPROVED
  REJECTED
  ARCHIVED
}

enum CopyrightStatus {
  OWNED
  LICENSED
  LINK_ONLY
  UNKNOWN
}
```

Un record de contenu agrege doit au minimum porter : `sourceRegistryId`, `externalId`, `canonicalUrl`, `originalAuthor`, `originalPublishedAt`, `retrievedAt`, `normalizedHash`, `origin`, `moderationStatus`, `copyrightStatus`, `termsUrlSnapshot` et `attributionRequired`.

## 5. Regle copyright et stockage externe

Pour tout contenu externe :

- stocker uniquement `title` ;
- stocker un resume court, redige ou valide par GabonConnect ;
- stocker le nom de la source ;
- stocker la date originale et la date de collecte ;
- stocker la categorie et les tags ;
- stocker l'URL canonique ;
- afficher la source et l'attribution ;
- afficher **Read original article ->** vers la source canonique.

Interdictions :

- pas de copie integrale de l'article ;
- pas de republication des paragraphes complets ;
- pas d'image externe sans licence, autorisation ou regle d'utilisation documentee ;
- pas de suppression de l'attribution ;
- pas de contournement d'un paywall ou d'une restriction technique ;
- pas d'usage d'un flux RSS comme autorisation implicite de republier.

En cas de doute sur les termes, `copyrightStatus = UNKNOWN`, moderation obligatoire et lien seul jusqu'a verification humaine.

## 6. Architecture d'agregation cible

### Pipeline nominal

1. **Fetch RSS/API**
   - selectionner les sources `active` ;
   - respecter robots, rate limits, authentication et termes ;
   - enregistrer statut HTTP, duree, taille, ETag/Last-Modified et erreur sans stocker de secret ;
   - borner taille, nombre d'items et temps d'execution.

2. **Normalize**
   - parser le format dans un schema interne ;
   - normaliser URL canonique, titre, date, langue et auteur ;
   - retirer HTML dangereux, tracking et contenu non requis ;
   - mapper categorie et tags vers la taxonomie canonique ;
   - calculer `normalizedHash`.

3. **Deduplicate**
   - chercher par `(sourceRegistryId, externalId)` ;
   - fallback par URL canonique ;
   - fallback prudent par hash titre/source/date ;
   - ne jamais fusionner automatiquement deux articles de sources differentes sans score de confiance ;
   - conserver l'historique des observations.

4. **AI Classify**
   - proposer categorie, tags, langue, niveau de confiance et resume court ;
   - ne jamais laisser l'IA decider seule du copyright, d'une sanction ou d'une publication sensible ;
   - rejeter les sorties hors schema, hallucinees ou contenant un texte integral ;
   - journaliser version du modele et prompt template sans donnees personnelles.

5. **Moderation Queue**
   - placer les nouveaux contenus en `PENDING_REVIEW` ;
   - montrer source, URL canonique, droits, confiance, doublons possibles et diff ;
   - permettre correction de categorie, resume, attribution et date ;
   - permettre rejet, archivage, blocage de source et demande de verification.

6. **Publish**
   - publier uniquement apres validation des champs obligatoires et droits ;
   - exposer source, date, categorie et canonical URL ;
   - revalider l'URL et l'etat de la source ;
   - notifier les utilisateurs uniquement apres publication ;
   - rendre le contenu retractable sans supprimer l'audit trail.

### Retry et fiabilite

- backoff exponentiel avec jitter ;
- idempotence par source et item externe ;
- dead-letter queue pour items echoues ;
- circuit breaker pour source instable ;
- quotas par source ;
- metriques : fetch success rate, parse failures, duplicates, moderation latency, publication rate et retractations.

## 7. Specification Admin Content Management : `/admin/content`

### Wireframe fonctionnel

```text
+------------------------------------------------------------------+
| Content management                         [Fetch now] [Sources] |
+------------------------------------------------------------------+
| Queue: [Pending] [Published] [Rejected] [Archived]              |
| Search [................] Category [..] Source [..] Origin [..]  |
+------------------------------------------------------------------+
| Status | Title / summary | Source | Category | Date | Confidence  |
| PENDING| ...             | ...    | ...      | ...  | 0.91        |
|        | [Review] [Edit] [Reject] [Archive] [Open original]      |
+------------------------------------------------------------------+
```

### Fonctions obligatoires

- tableau pagine avec recherche et filtres par statut, categorie, source, langue, origine et date ;
- creation manuelle d'un contenu original ou officiel ;
- edition du titre, resume court, categorie, tags, date, attribution et URL canonique ;
- apercu du rendu public avant publication ;
- publication, depublication, archivage et rejet avec raison obligatoire ;
- comparaison entre valeur source normalisee et valeur finale editoriale ;
- ouverture de l'original dans un nouvel onglet ;
- blocage temporaire d'une source ;
- lancement manuel d'un fetch autorise ;
- historique des changements, acteur, date et raison ;
- alertes sur canonical URL absente, source inactive, droits inconnus ou contenu expire.

### Regles d'autorisation

- `ADMIN` : gestion globale des sources, moderation, publication et archivage ;
- `EDITOR` futur : creation/edition/moderation sans gestion des roles ni suppression irreversible ;
- `USER` : aucun acces a `/admin/content` ;
- toute action revalide la session, le role, l'identifiant et le statut courant côté serveur ;
- les mutations utilisent des transitions valides et idempotentes ;
- une suppression physique est reservee a une procedure de retention documentee ; l'archivage est le comportement par defaut.

## 8. I18n et accessibilite

- Les identifiants de categories et statuts restent stables ; seuls les libelles sont traduits.
- Les titres provenant d'une source restent dans leur langue originale avec badge de langue.
- Le resume peut avoir une version FR et EN distincte si une traduction humaine ou validee existe ; sinon afficher la langue originale.
- Traduire les etats de queue, erreurs de fetch, droits inconnus, confirmations et notifications.
- Les dates, nombres, scores et heures sont localises, mais les dates originales restent exactes.
- Les actions Admin ont des labels accessibles, focus visible, navigation clavier et etats de chargement.
- Les URLs et titres longs doivent etre tronques visuellement sans perdre l'acces lecteur d'ecran.

## 9. Securite, confidentialite et retention

- Les secrets API et tokens de sources restent server-only.
- Les controles d'acces sont verifies par Server Action/API, jamais uniquement dans l'interface.
- Les flux externes sont proteges contre SSRF : allowlist de protocoles, blocage reseau prive, limites de redirection et timeout.
- Le HTML entrant est sanitize ou ignore ; aucun script source n'est rendu.
- Les donnees personnelles de contacts, auteurs ou utilisateurs ne sont pas agregees sans base legale/consentement.
- Les logs ne contiennent ni tokens, ni contenu prive, ni payload integral inutile.
- Politique de retention a definir : items bruts ephemeres, metadata normalisee durable, audit trail conserve selon obligation.
- Une demande de retrait copyright doit pouvoir masquer immediatement le contenu tout en conservant une trace minimale de moderation.

## 10. Criteres d'acceptation de Task 049

Task 049 est acceptee lorsque :

- les sept modules sont audites avec etat actuel, lacunes et besoins ;
- la taxonomie exacte des huit categories est adoptee ;
- le schema `SourceRegistry` ci-dessus est valide par produit, legal et technique ;
- le pipeline Fetch -> Normalize -> Deduplicate -> AI Classify -> Moderation Queue -> Publish est documente ;
- la regle copyright title/short summary/source/date/category/canonical URL est explicite ;
- le wireframe et les permissions `/admin/content` sont definis ;
- les decisions sur provenance, moderation, URL canonique et retention sont tracees ;
- aucun code runtime n'est modifie dans cette Task.

## 11. Prochaines etapes proposees

1. **Task 050** : migration `SourceRegistry` et champs de provenance, avec contraintes et backfill.
2. **Task 051** : fetcher RSS/API server-only et journalisation des runs.
3. **Task 052** : normalisation, deduplication et moderation queue.
4. **Task 053** : `/admin/content`, transitions de statut et audit trail.
5. **Task 054** : classification assistee, traduction validee et notifications apres publication.
6. **Task 055** : legal/copyright, performance, retention et tests de charge.
