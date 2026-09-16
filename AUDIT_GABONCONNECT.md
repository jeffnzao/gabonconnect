# Audit global GabonConnect

**Task :** 071 — Audit global GabonConnect
**Date :** 16 septembre 2026
**Périmètre :** dépôt `jeffnzao/gabonconnect`, branche `master`, audit statique du code versionné.
**Méthode :** lecture de l’architecture Next.js, des routes App Router, des modules métier, du schéma Prisma, des migrations, des tests, de la configuration Supabase/Prisma et des documents d’audit existants. Aucun code applicatif n’a été modifié dans le cadre de cet audit.

## Synthèse exécutive

GabonConnect est déjà une application full-stack structurée autour de Next.js 16 App Router, TypeScript, Tailwind CSS v4, Supabase SSR et Prisma 7 avec adaptateur PostgreSQL. Le dépôt expose une surface fonctionnelle importante : **62 pages App Router**, **8 routes API**, **30 migrations Prisma** et **24 fichiers de tests**. Les domaines couverts sont cohérents avec une plateforme de diaspora : annuaire, membres, actualités, événements, opportunités, procédures administratives, associations, campus, messagerie, notifications, feed communautaire, ingestion de sources et assistant RAG.

La maturité fonctionnelle est toutefois hétérogène. Le socle CRUD, l’authentification Supabase, les migrations Prisma et le moteur de pertinence sont bien représentés dans le code et les tests. En revanche, la recherche vectorielle reste un scan applicatif borné sur des vecteurs `Float[]`, l’assistant dépend d’un appel OpenAI direct avec un modèle par défaut ancien/non validé par configuration, plusieurs flux d’ingestion sont des scripts ou cron à sécuriser opérationnellement, et la coexistence Supabase/Prisma exige une gouvernance stricte des migrations et de l’autorisation.

**Verdict :** base prometteuse et riche, proche d’un MVP avancé ; passage en production recommandé seulement après durcissement de l’observabilité, des contrôles d’accès, du RAG, des jobs d’ingestion et de la validation de déploiement.

## 1. Architecture actuelle

- Frontend et serveur : Next.js 16, App Router, React 19.2, TypeScript.
- Style : Tailwind CSS v4, composants React et icônes Lucide.
- Données métier : Prisma 7 + PostgreSQL, client généré sous `app/generated/prisma` et adaptateur `@prisma/adapter-pg`.
- Auth/session : Supabase Auth via `@supabase/ssr`, rafraîchissement de session dans `proxy.ts`.
- APIs : route handlers dans `app/api`, logique métier principalement dans `lib/**` et `lib/actions/**`.
- Contenus : modèles éditoriaux, modération, sources et agrégation séparés des écrans d’administration.
- Tests : tests TypeScript exécutés par `tsx`, sans indication d’une suite E2E navigateur dans les scripts du manifeste.

L’organisation est globalement modulaire, mais la frontière entre Server Actions, routes API, services métier et accès direct Prisma/Supabase n’est pas encore un contrat unique. Cette pluralité est acceptable à court terme, à condition d’imposer des règles d’entrée et d’autorisation communes.

## 2. Fonctionnalités existantes

- Accueil, exploration géographique, annuaire des membres et profils.
- Authentification, inscription, onboarding et gestion de profil.
- Feed communautaire, publications, commentaires, likes et connexions.
- Actualités, événements, opportunités et candidatures.
- Associations, membres d’association, campus, bourses et logement.
- Procédures administratives et suivi de progression.
- Consulats et répertoire de sources.
- Messagerie et notifications.
- Assistant IA, recherche sémantique/RAG et corpus historique/mémoire.
- Agrégation de sources, extraction de contenus et modération administrateur.
- Pages légales CGU/RGPD, bannière de cookies, SEO et en-têtes de sécurité.
- Routes cron pour l’agrégation et l’ingestion.

## 3. Fonctionnalités réellement opérationnelles

**Fortement corroborées par le dépôt :**

- Le routage App Router et les parcours principaux ont des pages dédiées.
- Le schéma de données est matérialisé par des migrations versionnées et couvre les principaux domaines.
- Les modules métier ont des tests unitaires ciblés : auth, sécurité, membres, événements, opportunités, feed, messagerie, notifications, recherche, GRE, ingestion et RAG.
- La session Supabase est rafraîchie côté serveur par `proxy.ts`, avec repli gracieux si les variables Supabase ne sont pas présentes.
- Les fonctions RAG filtrent les contenus indexables par statut de publication/modération et ajoutent les attributions de sources.
- Le fallback extractif permet à l’assistant de répondre sans clé OpenAI, ce qui facilite les tests et le développement.

**À confirmer dans un environnement de recette :**

- Exécution complète de toutes les migrations sur la base Vercel/Supabase réellement utilisée.
- Fonctionnement des cron jobs avec leurs secrets et leurs limites de durée.
- Rafraîchissement de session et redirections dans les domaines de preview et de production.
- Parcours multi-utilisateur de messagerie, connexions, candidatures et modération.
- Indexation RAG après publication réelle et qualité des réponses sur un corpus représentatif.

## 4. Fonctionnalités incomplètes ou fragiles

- Le RAG n’utilise pas encore un index vectoriel PostgreSQL/pgvector : les candidats sont chargés puis comparés côté application, avec une borne à 1 000 lignes.
- L’assistant appelle directement OpenAI, sans abstraction de fournisseur ni validation centralisée du modèle ; la configuration de modèle est indépendante de la configuration IA du projet.
- Le fallback local est utile pour les tests mais ne constitue pas une recherche sémantique de qualité production.
- Les flux d’ingestion et de publication sont présents sous forme de scripts/actions, mais leur idempotence, leur reprise après erreur et leur observabilité doivent être prouvées en production.
- La coexistence des tables Prisma et de la table `feedbacks` Supabase exige un suivi séparé des migrations et des politiques RLS.
- L’absence visible de tests E2E et de vérification de contrats API laisse un risque de régression sur les parcours interactifs.
- La couverture exacte des traductions, des états vides, des erreurs réseau et de l’accessibilité mobile doit être mesurée, pas seulement déduite des pages existantes.

## 5. Dette technique

- Duplication potentielle entre Server Actions et route handlers pour les mêmes cas d’usage.
- Nommage et compatibilité de l’entrée Next.js à surveiller : le dépôt utilise `proxy.ts`, tandis que des fichiers historiques ou conventions `middleware.ts` apparaissent dans l’historique du projet.
- Le client Prisma est proxifié et initialisé à la demande, ce qui évite un accès au build, mais rend les erreurs de variables et de schéma tardives ; un diagnostic de démarrage explicite serait préférable.
- Des migrations portant des noms proches sur les connexions indiquent une histoire de corrections successives à consolider dans la documentation de déploiement.
- Le schéma contient des enums et modèles de domaines très nombreux ; il faut éviter d’ajouter de nouveaux champs sans index, règles de cycle de vie et tests de migration.
- Les commentaires de tâches historiques dans le code sont utiles pour la traçabilité mais ne remplacent pas une documentation d’architecture maintenue.

## 6. Sécurité

**Points positifs :**

- Clés Supabase publiques séparées de la clé `SUPABASE_SERVICE_ROLE_KEY` serveur.
- Session lue par Supabase SSR et `getUser()` plutôt que par une simple lecture non vérifiée du JWT.
- En-têtes `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options` et `Referrer-Policy` présents dans le proxy.
- Validation et gardes de sécurité couvertes par des tests dédiés.
- La logique serveur centralise l’accès Prisma au lieu d’exposer directement la base au navigateur.

**Risques à traiter :**

- Vérifier que toutes les Server Actions, routes API, cron routes et fonctions admin appliquent une autorisation métier, pas seulement une présence de session.
- Vérifier que les routes cron exigent un secret dédié et ne sont pas seulement protégées par leur chemin.
- Ajouter une politique CSP en mode report-only puis enforcing après inventaire des domaines nécessaires.
- Auditer les logs pour éviter l’exposition de prompts, contenus privés, emails, tokens ou erreurs SQL.
- Tester les contrôles IDOR sur chaque identifiant reçu depuis l’URL ou le corps JSON.
- Confirmer les politiques RLS sur chaque table Supabase exposée ; Prisma ne remplace pas RLS lorsque le client Supabase est utilisé.
- Ajouter limitation de débit et taille maximale de payload sur assistant, messagerie, feedback et endpoints d’ingestion.

## 7. Base de données — Prisma / Supabase

Le schéma PostgreSQL Prisma est riche et relationnel : utilisateurs, géographie, profils, articles, événements, opportunités, procédures, associations, messagerie, notifications, sources d’ingestion, modération, embeddings et corpus historique. Les relations utilisent des contraintes et plusieurs index métier ; les migrations Prisma sont nombreuses et versionnées.

Supabase intervient pour l’authentification SSR et au moins pour `feedbacks`, avec une migration SQL dédiée. Cette séparation est viable, mais doit être explicitement documentée : qui possède chaque table, quel outil migre quoi, quelle connexion est utilisée en runtime et quelles politiques RLS sont la source d’autorité.

Recommandations :

- Maintenir un runbook unique `prisma migrate deploy` + migrations Supabase ordonnées.
- Interdire les modifications manuelles en production hors procédure de migration.
- Vérifier les index sur toutes les colonnes de filtrage, tri et jointure des listes paginées.
- Ajouter des contraintes de longueur, de statut et d’unicité là où la logique applicative les suppose.
- Préparer une stratégie d’archivage pour messages, logs d’ingestion, embeddings et contenus historiques.

## 8. RAG / Embeddings

Le pipeline est clairement identifié : génération d’embeddings, découpage en chunks, indexation des contenus publiés/approuvés, recherche par similarité cosinus, puis génération ancrée avec citations. Les sources couvrent actualités, procédures, événements, opportunités, bourses et corpus historique/diaspora.

Limites actuelles :

- `ContentEmbedding.embedding` est stocké comme tableau de flottants et comparé en mémoire ; cela ne scale pas correctement.
- La recherche applique une borne de candidats et ne bénéficie pas de HNSW/IVFFlat, de pgvector, de filtres SQL vectoriels ni de hybrid search.
- Le modèle d’embedding n’est pas versionné dans une stratégie de migration/reindex globale.
- Le prompt impose les citations, mais l’évaluation automatique de factualité, de rappel et de précision n’est pas visible.
- Les corpus historiques peuvent avoir une attribution textuelle sans URL canonique, ce qui limite la vérifiabilité utilisateur.

## 9. Moteur GRE — Gabon Relevance Engine

Le GRE est présent dans `lib/aggregation/gabon-relevance.ts`, `lib/relevance/gabon-relevance-engine.ts`, la taxonomie associée, les tests et les analytics. Il intervient dans la qualification de contenu et la priorisation de la pertinence Gabon/diaspora.

La présence de tests dédiés est un bon signal. Pour atteindre un niveau production, le GRE doit cependant disposer de :

- version de règles et changelog des pondérations ;
- dataset de référence annoté par domaine ;
- métriques de précision/rappel et suivi des faux positifs ;
- séparation claire entre pertinence, sécurité éditoriale et statut de publication ;
- possibilité d’expliquer le score à l’administrateur ;
- mécanisme de recalcul idempotent lorsque la taxonomie évolue.

## 10. Authentification & RLS

Supabase Auth est la source d’identité ; `ensureUser` synchronise l’utilisateur authentifié dans Prisma par upsert. Le rôle applicatif Prisma distingue notamment `USER` et `ADMIN`.

La séparation identité Supabase / profil métier Prisma est saine, mais les contrôles doivent rester cohérents :

- ne jamais autoriser sur la seule base de `user_metadata` modifiable par l’utilisateur ;
- vérifier le propriétaire de chaque ressource avant lecture, modification ou suppression ;
- tester les opérations UPDATE avec policy SELECT correspondante côté Supabase ;
- documenter quels accès passent par RLS et lesquels passent par Prisma côté serveur ;
- invalider ou vérifier les sessions pour les opérations sensibles si une garantie immédiate de révocation est nécessaire ;
- couvrir les rôles admin par tests négatifs, notamment utilisateur authentifié non-admin.

## 11. UX / UI

La couverture d’écrans est large et les domaines sont regroupés dans des parcours lisibles : dashboard, exploration, feed, annuaire, contenu et administration. Tailwind v4 et les composants existants permettent une cohérence visuelle sans dépendance excessive.

Points à améliorer :

- formaliser les états loading, empty, error et offline sur chaque liste ;
- uniformiser les retours de mutation, notifications toast et messages d’erreur ;
- vérifier les liens entre pages légales, profil, contact et gestion des consentements ;
- maintenir un système de tokens et de composants plutôt que des variantes locales ;
- auditer les contrastes, labels, focus clavier, dialogues et annonces pour lecteurs d’écran.

## 12. Mobile

La structure App Router et Tailwind permet une approche responsive mobile-first, mais aucune preuve automatisée de parcours mobile n’est référencée dans les scripts. Les risques principaux sont les tableaux d’administration, les cartes, les formulaires longs, la messagerie et les widgets fixes qui peuvent recouvrir le contenu.

À valider sur viewport étroit : navigation, assistant, footer, bannière cookies, cartes géographiques, champs de recherche, pièces jointes éventuelles et modales. Prévoir safe areas iOS, hauteur dynamique du viewport et zones tactiles d’au moins 44 px.

## 13. Performance

Le build lance `prisma generate` puis `next build`, ce qui garantit une génération du client avant compilation mais ajoute du temps de build. Les accès Prisma sont côté serveur et le proxy exclut les assets statiques de son matcher.

Risques de performance :

- scan en mémoire des embeddings ;
- listes potentiellement non paginées ou triées sans index adapté ;
- appels externes OpenAI synchrones dans le chemin de réponse ;
- ingestion et extraction potentiellement coûteuses dans des routes cron ;
- cartes et modules client lourds à charger sans découpage dynamique.

Mesurer TTFB, LCP, CLS, INP, durée des routes API, requêtes Prisma et temps d’ingestion avant optimisation ciblée.

## 14. Déploiement Vercel

Le projet est compatible avec un déploiement Vercel Next.js standard et possède une configuration d’environnement documentée dans `.env.example`. Les variables essentielles identifiées sont `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, une clé Supabase publique et, pour la modération, une clé service serveur.

Checklist avant production :

- variables renseignées séparément en Preview et Production ;
- migrations Prisma et Supabase exécutées dans le bon ordre ;
- secrets cron distincts et rotation documentée ;
- OpenAI/RAG configuré ou fallback explicitement accepté ;
- logs et alertes configurés pour erreurs de route, cron et base ;
- build de production validé sur un commit propre ;
- domaine HTTPS et redirection testés ;
- taille/durée des fonctions compatible avec ingestion et assistant.

## 15. Données

Les données sont structurées autour d’un modèle riche : identité, géographie, contenus éditoriaux, activités communautaires, procédures et corpus historique. Les contenus ingérés ont des métadonnées de source, de fiabilité, de langue et de statut, ce qui est adapté à une plateforme orientée confiance.

Les exigences de gouvernance sont élevées : provenance obligatoire, date de vérification, statut de modération, dépublication, suppression utilisateur, export des données personnelles, rétention des messages/logs et traitement des doublons. La table des embeddings doit suivre le cycle de vie du contenu source et être purgée à la dépublication.

## 16. Roadmap actuelle

Les indices du dépôt montrent une progression par tâches numérotées : fondation MVP, associations, connexions, import, événements, opportunités, feed, messagerie, notifications, procédures, campus, sources, agrégation, GRE, RAG, corpus historique et assistant. Les audits existants (`AUDIT_V0.2.0_ARCHITECTURE.md`, `AUDIT_TASK_049_DATA_CONTENT.md`) montrent une volonté de documenter avant les migrations structurantes.

La prochaine étape ne devrait pas être l’ajout d’un nouveau domaine fonctionnel. Elle devrait consolider la fiabilité transversale : contrat d’autorisation, qualité des données, recherche vectorielle, jobs d’arrière-plan, observabilité et tests de parcours.

## 17. Écarts avec la vision globale du Prompt Maître

En l’absence du Prompt Maître complet dans le périmètre versionné de cet audit, l’écart est évalué par rapport aux objectifs visibles du dépôt : plateforme de référence pour la diaspora gabonaise, contenus fiables, moteur de pertinence, assistant contextualisé et services communautaires.

- **Vision plateforme complète :** couverture fonctionnelle avancée, mais maturité opérationnelle inégale.
- **Vision de confiance :** provenance et modération présentes ; RLS, audit logs et observabilité doivent être démontrés de bout en bout.
- **Vision IA/RAG :** architecture et citations présentes ; infrastructure vectorielle et évaluation qualité encore insuffisantes pour un scale important.
- **Vision diaspora :** exploration géographique, corpus historique et impacts diaspora existent ; les données doivent encore être enrichies, vérifiées et éditorialisées.
- **Vision production :** déploiement Vercel prévu ; runbook, alertes, tests E2E et gestion des secrets restent à formaliser.

## 18. Priorités

1. **P0 — Production sûre :** établir une matrice d’autorisation par ressource et route, vérifier RLS Supabase, protéger cron/API, ajouter rate limiting, CSP et tests négatifs.
2. **P0 — Déploiement fiable :** documenter et tester migrations Prisma/Supabase, variables Vercel, rollback, logs, alertes et jobs idempotents.
3. **P1 — RAG scalable :** migrer vers pgvector ou un moteur vectoriel adapté, versionner les modèles, reindexer de façon contrôlée et mesurer la qualité.
4. **P1 — Contrats et parcours :** ajouter tests E2E des parcours auth, contenu, messagerie, notifications, admin et mobile.
5. **P2 — Qualité éditoriale :** outiller le GRE avec dataset annoté, explications de score, tableaux de bord et suivi des sources périmées.

## 19. Risques

- **Risque critique :** fuite ou élévation de privilèges si une route accepte un identifiant sans contrôle de propriétaire.
- **Risque critique :** exposition de données si une table Supabase est accessible sans RLS correcte.
- **Risque élevé :** coûts et latence croissants du scan applicatif des embeddings.
- **Risque élevé :** jobs cron non idempotents ou interrompus au milieu d’une ingestion.
- **Risque élevé :** divergence entre schéma Prisma, migrations Supabase et base réellement déployée.
- **Risque moyen :** régression UX mobile sur les écrans denses et widgets fixes.
- **Risque moyen :** réponses IA insuffisamment vérifiables malgré les citations si le corpus est incomplet ou obsolète.
- **Risque moyen :** absence d’alertes entraînant une dégradation silencieuse de l’ingestion ou de la synchronisation des profils.

## 20. Plan de travail recommandé

- Figer un modèle d’architecture cible : Server Components pour lecture, Server Actions ou API selon contrat, services métier partagés, Prisma/Supabase avec responsabilités explicites.
- Produire une matrice route → session → rôle → propriétaire → action et la convertir en tests.
- Auditer puis corriger RLS, secrets cron, validation des entrées, limites de payload et journaux.
- Mettre en place une chaîne CI : typecheck, lint, tests unitaires, migration dry-run, build et tests E2E ciblés.
- Stabiliser les jobs d’ingestion : idempotence, verrouillage, reprise, métriques, statut et dead-letter/revue admin.
- Migrer la recherche vectorielle vers une solution indexée, avec version de modèle et procédure de reindex.
- Ajouter observabilité produit et technique : erreurs, latence, qualité des sources, GRE, RAG, conversion des parcours.
- Valider l’accessibilité et le responsive sur les parcours prioritaires avant chaque release.
- Maintenir les audits, le runbook de production et les décisions d’architecture à chaque jalon.

## Prochaines tâches prioritaires

### NOW — Sécuriser et tester les frontières serveur

Construire la matrice d’autorisation des routes/API/Server Actions, vérifier les RLS Supabase et ajouter les tests négatifs IDOR, rôle admin, cron et payloads invalides.

### NEXT — Fiabiliser le déploiement et les jobs

Documenter les migrations Prisma/Supabase et les variables Vercel, puis rendre les routes cron d’ingestion idempotentes, observables et rejouables sans doublons.

### LATER — Industrialiser le RAG

Adopter une recherche vectorielle indexée, versionner les embeddings, définir un corpus d’évaluation et mesurer précision, rappel, citations et fraîcheur des réponses de l’assistant.

---

**Limite de l’audit :** ce rapport est une analyse statique du dépôt. Les données de production, les politiques RLS effectives, les variables Vercel, les métriques runtime et les résultats de tests de charge doivent être vérifiés séparément dans un environnement autorisé avant une décision de mise en production.

**Fichier ajouté :** `AUDIT_GABONCONNECT.md`
**Modification applicative :** aucune.
