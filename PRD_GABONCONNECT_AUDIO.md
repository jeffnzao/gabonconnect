# PRD — GabonConnect Audio

**Phase 4 · Task 075**
**Statut :** Cadrage (MVP en cours — Task 075.1)
**Dernière mise à jour :** 2026-09-17

---

## 1. Vision & objectifs

GabonConnect Audio est la brique sonore de la plateforme : une **radio communautaire**
et une **bibliothèque musicale** dédiées à la culture gabonaise et à sa diaspora.
L'objectif est de valoriser les artistes gabonais, d'offrir un espace d'écoute
légal et rémunérateur, et de renforcer le lien culturel de la diaspora avec le pays.

**Objectifs produit**

1. Diffuser la chaîne **GabonConnect Radio** (flux en direct, plusieurs univers).
2. Proposer une **bibliothèque** d'œuvres et d'enregistrements à la demande.
3. Garantir un cadre **de droits musicaux** rigoureux (aucune diffusion sans accord).
4. Mesurer l'audience de façon **fiable et anti-fraude** pour reverser des redevances justes.
5. Offrir une **expérience d'écoute continue** (lecteur persistant multi-pages).

**Indicateurs de succès (MVP)**

- Temps d'écoute moyen par session.
- Taux d'écoutes comptabilisées (>= 30 s) vs écoutes brutes.
- Nombre d'œuvres avec droits `CLEARED`.
- Part d'écoutes marquées frauduleuses (< 2 % visé).

---

## 2. Périmètre

### Dans le périmètre (Phase 4)

- Radio en direct multi-chaînes.
- Lecteur global persistant (web).
- Modèle de données des droits musicaux.
- Journalisation des écoutes (PlayEvent) et socle anti-fraude.

### Hors périmètre (phases ultérieures)

- Paiement/reversement automatisé des redevances.
- Application mobile native et lecture hors-ligne.
- Upload public par les artistes en self-service (soumis à modération dédiée).
- Recommandations algorithmiques personnalisées.

---

## 3. Droits musicaux — principes

La diffusion repose sur une chaîne de droits explicite. **Aucun enregistrement
n'est diffusable si son `RightsAgreement` n'est pas au statut `CLEARED` et valide
pour le territoire de l'auditeur.**

| Statut       | Signification                                             | Diffusable |
| ------------ | --------------------------------------------------------- | ---------- |
| `PENDING`    | Accord en cours d'instruction                             | Non        |
| `CLEARED`    | Droits validés, diffusion autorisée                       | Oui        |
| `RESTRICTED` | Diffusion limitée (territoire / période)                  | Partiel    |
| `REJECTED`   | Droits refusés                                            | Non        |
| `EXPIRED`    | Accord échu (au-delà de `validUntil`)                     | Non        |

**Modèles de rémunération (`RoyaltyModel`)** : `FREE`, `REVENUE_SHARE`,
`FLAT_FEE`, `PER_STREAM`. Le calcul des redevances s'appuie exclusivement sur les
`PlayEvent` **comptabilisés** (voir §6).

---

## 4. Modèle de données

Les types du domaine sont implémentés dans [`types/audio.ts`](./types/audio.ts).

### 4.1 `Artist`

Auteur ou interprète (personne ou groupe). Champs clés : `slug`, `displayName`,
`countryCode`, `verified`. Rattaché à une ou plusieurs œuvres.

### 4.2 `AudioWork` (œuvre / composition)

Entité de référence protégée par le droit d'auteur. Champs clés : `title`,
`artistId`, `genre`, `iswc` (code international de l'œuvre), `explicit`.

### 4.3 `Recording` (enregistrement / master)

Un master concret rattaché à une œuvre. Champs clés : `isrc`, `streamUrl`,
`durationSec` (`null` pour un flux radio), `isLiveStream`. Porte le
`RightsAgreement` qui conditionne sa diffusion.

### 4.4 `RightsAgreement` (accord de droits)

Autorise la diffusion d'un `Recording`. Champs clés : `status`, `royaltyModel`,
`revenueSharePct`, `territories` (ISO alpha-2, `["*"]` = monde), `rightsHolder`,
`validFrom` / `validUntil`, `documentUrl`.

### 4.5 `PlayEvent` (événement d'écoute)

Trace unitaire d'une écoute. Base des redevances et de l'anti-fraude. Champs
clés : `recordingId`, `userId` (ou `null`), `sessionId`, `playedSec`,
`countedForRoyalty`, `fraudScore`, `source`, `countryCode`.

### Relations (résumé)

```
Artist 1 ─── n AudioWork 1 ─── n Recording 1 ─── 1 RightsAgreement
                                     │
                                     └── n PlayEvent
```

---

## 5. Spécifications UX — lecteur persistant

Le lecteur global (`components/audio/global-player.tsx`) est monté une seule fois
dans le layout racine et **survit à la navigation** entre les pages.

**Comportements**

- Ancré en bas de l'écran (`fixed`), au-dessus du contenu (`z-60`), sur fond translucide.
- Affiche : visuel, titre, artiste, transport (précédent / lecture-pause / suivant),
  volume, et fermeture.
- **Direct (radio)** : pas de barre de progression ; indicateur « Direct » et
  masquage des commandes de position.
- **À la demande** : barre de progression cliquable avec temps écoulé / durée.
- **Autoplay** : tentative best-effort au chargement de la page Radio ; en cas de
  blocage navigateur (politique d'autoplay), le bouton Lire reste disponible — aucun
  échec bloquant.
- File de lecture : enchaînement automatique en fin de piste ; « précédent » revient
  au début si > 3 s écoulées.
- Accessibilité : rôle `region`, libellés ARIA sur toutes les commandes, cibles
  tactiles suffisantes, navigation clavier.

**États** : `idle`, `loading`, `playing`, `paused`, `error`. L'état `error`
affiche « Flux indisponible » sans casser la navigation.

---

## 6. Mesure & anti-fraude

**Seuil de comptabilisation** : une écoute n'est comptabilisée pour les redevances
(`countedForRoyalty = true`) qu'à partir de **30 secondes** d'écoute effective
(`playedSec >= 30`), conformément aux standards de l'industrie.

**Signaux de risque (`fraudScore`, 0 → 1)**

- Volume anormal d'écoutes par `sessionId` / `userId` / IP sur une fenêtre courte.
- Écoutes en boucle sur un même `recordingId` sans variation.
- Cadence inhumaine (démarrages rapprochés, absence d'interaction).
- Incohérences géographiques (`countryCode`) ou signatures de bots.
- Sessions anonymes massives derrière un même réseau.

**Règles**

- Un `PlayEvent` avec `fraudScore` élevé est journalisé mais **exclu** du calcul
  des redevances.
- Dédoublonnage par `sessionId` pour éviter le double comptage d'une même écoute.
- Les journaux sont conservés pour audit et contestation des ayants droit.
- Aucune donnée personnelle superflue n'est collectée (conformité RGPD du projet).

---

## 7. Découpage des tâches

- **Task 075** — Ce document de cadrage (PRD). ✅
- **Task 075.1** — MVP : `types/audio.ts`, lecteur global persistant, page `/radio`. ✅
- **Task 075.2** — Persistance : modèles Prisma, endpoint de journalisation `PlayEvent`.
- **Task 075.3** — Bibliothèque à la demande + files de lecture / playlists.
- **Task 075.4** — Tableau de bord artistes + reversement des redevances.
- **Task 075.5** — Moteur anti-fraude (scoring serveur + tableau de modération).

---

## 8. Risques & dépendances

- **Disponibilité des flux** : dépend d'un fournisseur de streaming fiable
  (les URLs sont configurables via variables d'environnement `NEXT_PUBLIC_RADIO_*`).
- **Droits** : la diffusion est bloquée tant que les accords ne sont pas `CLEARED`.
- **Autoplay navigateur** : politiques restrictives — géré en best-effort.
- **Fraude** : nécessite un scoring côté serveur (phase ultérieure) pour être robuste.
