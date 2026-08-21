# GabonConnect — Project Context

## RÈGLE IMPORTANTE POUR CLAUDE

Avant de commencer une nouvelle Task :

1. Lire ce fichier.
2. Inspecter le dépôt réel.
3. Ne pas demander à l'utilisateur de réexpliquer les Tasks précédentes déjà marquées comme validées ici.
4. Ne pas refaire une Task déjà validée.
5. Ne pas modifier une partie hors périmètre sans signaler clairement pourquoi.
6. Toujours travailler sur l'état réel du dépôt, pas sur une ancienne conversation.
7. Si une incohérence est découverte, la signaler avant de modifier.
8. Ne jamais lancer de migration, reset, suppression de données ou modification RLS sans validation explicite lorsque la Task ne le demande pas.

---

# Projet

Nom : GabonConnect

Concept :
Plateforme numérique de la diaspora gabonaise.

Stack :
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Prisma 7
- PostgreSQL / Supabase
- Supabase Auth
- Supabase SSR
- Server Components par défaut
- Server Actions pour les mutations

---

# Version

Source de vérité :
`package.json`

La version affichée dans l'application est dérivée de `package.json`.

Version actuelle :
`0.1.4`

---

# Architecture Auth

Supabase Auth est la source d'autorité pour l'authentification.

Architecture :

Supabase Auth
→ auth.users.id
→ public.users.id
→ public.profiles.userId

Fonctions déjà validées :

- `getCurrentUser()`
- `ensureUser()`

Règles :
- Ne jamais accepter `userId` depuis un formulaire.
- Toujours déterminer l'utilisateur depuis la session serveur.
- Utiliser `ensureUser()` pour les mutations nécessitant l'utilisateur courant.
- Supabase SSR est déjà configuré.
- `middleware.ts` est nécessaire au rafraîchissement de session.

---

# Parcours Auth déjà validé

Le cycle suivant est considéré comme TERMINÉ :

- inscription email/password
- confirmation email Supabase
- `/auth/confirm`
- création/synchronisation de `public.users`
- création de profil
- connexion utilisateur existant
- déconnexion
- `/profile`
- protection des routes
- profil PUBLIC / PRIVATE
- accès propriétaire uniquement à son profil

Ne pas refaire ces fonctionnalités sauf si une Task explicite demande une évolution.

---

# RLS

RLS est activé.

Principes validés :

PUBLIC :
- visible par tout le monde.

PRIVATE :
- invisible dans le répertoire public.

Utilisateur connecté :
- peut lire son propre profil.
- peut modifier son propre profil.
- peut créer son propre profil.

Un utilisateur ne peut jamais modifier le profil d'un autre utilisateur.

---

# Members

Task Members Directory : TERMINÉE.

Routes :

`/members`

`/members/[id]`

Fonctionnalités validées :

- recherche
- filtre profession
- filtre continent
- filtre pays
- filtre ville
- pagination serveur
- profils PUBLIC uniquement
- compteur de résultats
- cartes membres
- profil public détaillé

Sécurité :
- les requêtes publiques filtrent toujours `visibility = PUBLIC`
- un profil PRIVATE doit retourner 404 sur `/members/[id]`

---

# Public Member Profile

Task Member Profile v1 : TERMINÉE.

Structure :

Hero
About
Location
Professional

Metadata :
- pas d'information inventée
- profil PRIVATE et profil inexistant ne doivent pas être distinguables publiquement.

---

# Associations

Association profile :
- `/associations/[slug]`
- `lib/association-profile.ts`

Task Association Membership :
EN COURS / À FINALISER.

État important :
- le modèle `AssociationMember` doit être présent dans Prisma avant de considérer la fonctionnalité terminée.
- la migration doit être appliquée.
- `page.tsx` doit réellement utiliser `JoinButton`.
- les actions doivent utiliser `ensureUser()`.
- un utilisateur ne peut pas fournir son propre `profileId` au client.
- seuls les associations `APPROVED` peuvent être rejointes.

---

# Prisma

Le schéma réel du dépôt est la référence.

IMPORTANT :
Le nom canonique de l'enum de visibilité est :

`ProfileVisibility`

Ne pas réintroduire `Visibility`.

---

# Versioning

À chaque Task terminée :

1. Tests
2. Lint
3. Commit
4. Push
5. Bump de version si demandé par la Task
6. Mettre à jour ce fichier si l'architecture ou l'état des Tasks change.

---

# Git

Convention :

feature/<task-name>

Exemples :

feature/member-directory
feature/member-profile-v1
feature/supabase-auth
feature/auth-profile-stabilization

Ne jamais merger automatiquement.

Ne jamais pousser sans que l'utilisateur le demande explicitement.

---

# État des Tasks

| Task | Fonctionnalité | État |
|------|----------------|------|
| 001 | Fondations projet | ✅ |
| 002 | Explore | ✅ |
| 003 | Members Directory | ✅ |
| 004 | Supabase Auth | ✅ |
| 004A | Auth foundation | ✅ |
| 004B | Email confirmation / SSR | ✅ |
| 004C | Join flow | ✅ |
| 004D | Login / My Profile | ✅ |
| 005 | Profile editing | 🔄 EN COURS |
| 006 | TBD | ⏳ |
| 007 | Association profile | ✅ |
| 008 | Association membership | 🔄 / À vérifier |

---

# Workflow obligatoire pour chaque nouvelle Task

Avant de coder :

### Étape 1 — Lire ce fichier

### Étape 2 — Inspecter le dépôt

Vérifier les fichiers réellement présents.

### Étape 3 — Identifier les dépendances de la Task

Ne pas réimplémenter les fonctionnalités déjà validées.

### Étape 4 — Planifier

Donner :
- fichiers à créer
- fichiers à modifier
- fichiers à ne pas toucher
- migrations éventuelles
- risques

### Étape 5 — Implémenter

Respecter strictement le périmètre.

### Étape 6 — Tester

Au minimum :

`npm run test`

`npm run lint`

Puis tests manuels indiqués dans la Task.

### Étape 7 — Rapport

Donner :
- fichiers modifiés
- fonctionnalités
- sécurité
- tests
- git status
- commit recommandé

---

# RÈGLE DE COMMUNICATION

L'utilisateur travaille parfois avec plusieurs instances/comptes Claude.

Il ne faut donc PAS supposer que l'historique conversationnel est disponible.

Le dépôt + `PROJECT_CONTEXT.md` constituent la source de continuité du projet.

Si une information n'est pas présente dans ce fichier :

1. inspecter le code réel ;
2. inspecter Git ;
3. seulement ensuite demander une clarification si nécessaire.

Ne jamais demander :
"Qu'avons-nous fait dans la Task précédente ?"

si cette information peut être déterminée depuis le dépôt ou ce fichier.