# PRD — GabonConnect Mémoire & Histoire

**Phase 5 · Task 076**
**Statut :** Cadrage + MVP (page `/histoire`)
**Dernière mise à jour :** 2026-09-17

---

## 1. Vision & objectifs

Le module **Mémoire & Histoire du Gabon** valorise le patrimoine historique du pays
et le relie à sa diaspora. Il offre une **frise chronologique interactive**, des
**fiches détaillées** d'événements et de figures emblématiques, un **espace d'archives**
et un **espace de contribution** ouvert aux récits de la diaspora.

**Objectifs produit**

1. Rendre l'histoire du Gabon accessible et navigable par période.
2. Documenter chaque contenu avec un **niveau de preuve / confiance** transparent.
3. Mettre en avant les **figures emblématiques** et les **événements fondateurs**.
4. Offrir un espace de **mémoire vivante** alimenté par la diaspora.

**Indicateurs de succès (MVP)**

- Part des contenus au niveau `LEVEL_A` (archives / académique).
- Nombre d'événements et de figures documentés par période.
- Taux d'utilisation des filtres de période sur la frise.
- Nombre de récits de diaspora soumis.

---

## 2. Périmètre

### Dans le périmètre (Phase 5 — Task 076)

- Taxonomie des périodes historiques `P1 → P7`.
- Taxonomie des niveaux de preuve `LEVEL_A → LEVEL_D`.
- Frise chronologique dynamique avec filtres par période et badge de niveau.
- Fiches détaillées : événements, figures emblématiques.
- Espace archives / documents.
- Espace de contribution de récits (diaspora) — présentation + formulaire d'intention.
- Jeu de données de démonstration complet en français.

### Hors périmètre (phases ultérieures)

- Persistance base de données et modération éditoriale des contributions.
- Recherche plein texte et cartographie interactive.
- Médiathèque (audio/vidéo) et numérisation d'archives.
- Traduction multilingue des fiches.

---

## 3. Taxonomie — périodes historiques (`P1 → P7`)

| Code | Période                              | Bornes                 |
| ---- | ------------------------------------ | ---------------------- |
| `P1` | Préhistoire & migrations             | Avant le XVe siècle    |
| `P2` | Royaumes & premiers contacts         | XVe – XVIIe siècle     |
| `P3` | Commerce atlantique & traite         | XVIIe – XIXe siècle    |
| `P4` | Colonisation française               | 1839 – 1910            |
| `P5` | Afrique-Équatoriale française        | 1910 – 1958            |
| `P6` | Indépendance & République            | 1960 – 1990            |
| `P7` | Époque contemporaine & transition    | 1990 – aujourd'hui     |

---

## 4. Taxonomie — niveaux de preuve / confiance (`LEVEL_A → LEVEL_D`)

| Niveau    | Signification                          | Exemple                                  |
| --------- | -------------------------------------- | ---------------------------------------- |
| `LEVEL_A` | Archives / Académique (source primaire)| Traité, décret, publication vérifiée     |
| `LEVEL_B` | Institutionnel                         | Presse de référence, ouvrage documenté   |
| `LEVEL_C` | Secondaire                             | Encyclopédie, article à recouper         |
| `LEVEL_D` | Tradition orale                        | Témoignage, récit transmis, à documenter |

Chaque contenu (événement, figure, archive, récit) porte **obligatoirement** un
niveau de preuve, affiché sous forme de badge coloré pour garantir la traçabilité.

---

## 5. Modèle de données

Les types et le jeu de données de démonstration sont implémentés dans
[`lib/histoire.ts`](./lib/histoire.ts).

### 5.1 `HistoricalPeriod`

Période structurante. Champs : `id` (`P1`…`P7`), `label`, `timespan`, `summary`.

### 5.2 `HistoricalEvent`

Événement de la frise. Champs : `year`, `title`, `period`, `sourceLevel`, `description`.

### 5.3 `HistoricalFigure`

Figure emblématique. Champs : `fullName`, `role`, `lifespan`, `period`, `sourceLevel`,
`biography`, `legacy`.

### 5.4 `HistoricalArchive`

Document / archive. Champs : `title`, `reference`, `period`, `sourceLevel`, `nature`,
`description`.

### 5.5 `DiasporaStory`

Récit contribué. Champs : `author`, `location`, `period`, `sourceLevel`, `title`, `excerpt`.

---

## 6. Spécifications UX — page `/histoire`

- **En-tête** : bandeau sombre aligné sur la charte (vert émeraude / sombre / blanc).
- **Onglets** : Frise · Figures · Archives · Diaspora.
- **Frise chronologique** : liste verticale ordonnée, filtres par période `P1 → P7`,
  chaque entrée affiche l'année, le titre, la description et le **badge de niveau**.
- **Filtres** : sélection d'une période (état d'URL via `?periode=Px`), réinitialisation possible.
- **Fiches figures** : cartes biographiques avec rôle, dates, héritage et badge de niveau.
- **Archives** : cartes documentaires avec référence, nature et badge de niveau.
- **Diaspora** : présentation des récits + bloc d'appel à contribution.
- **Accessibilité** : structure sémantique, libellés ARIA, contrastes conformes,
  navigation clavier sur les onglets et filtres.

---

## 7. Découpage des tâches

- **Task 076** — Ce document de cadrage (PRD) + taxonomie + page `/histoire` (MVP). ✅
- **Task 076.1** — Persistance base de données et back-office de contribution.
- **Task 076.2** — Modération éditoriale des récits de la diaspora.
- **Task 076.3** — Recherche plein texte + cartographie interactive.
- **Task 076.4** — Médiathèque (numérisation d'archives audio/vidéo).

---

## 8. Risques & dépendances

- **Fiabilité historique** : chaque contenu doit porter un niveau de preuve honnête ;
  les contenus `LEVEL_D` sont présentés comme mémoire orale, non comme fait établi.
- **Contributions** : nécessite une modération (phase ultérieure) avant persistance.
- **Sensibilité mémorielle** : traiter les figures et périodes avec neutralité et rigueur.
