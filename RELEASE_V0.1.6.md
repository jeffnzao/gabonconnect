# GabonConnect V0.1.6

GabonConnect V0.1.6 stabilise les parcours de publication, d'information et de connexion de la diaspora gabonaise.

## Accomplissements

- **CRUD stabilise** : creation, edition, publication et suppression des News, Shops, Events et Opportunities, avec controles d'authentification et retours d'etat.
- **FR/EN** : dictionnaires paritaires, langue francaise par defaut, persistance par cookie, metadonnees SEO localisees et etats de chargement/erreur/travail traduits.
- **Feedback 2.0** : collecte publique, affichage limite aux avis publies, statuts de moderation (`pending`, `published`, `hidden`, `processed`, `archived`) et back-office admin sur `/admin/feedbacks`.
- **News Hub editorial** : categories `GABON`, `INTERNATIONAL`, `DIASPORA`, `STUDENTS`, `CAMPUS`, `OPPORTUNITIES`, `POLITICS`, `ECONOMY`, `CULTURE` et `SPORTS`, recherche, tri, pagination et temps de lecture.
- **Homepage et carte diaspora** : architecture orientee comprehension en 30 secondes, recherche globale visible, Campus, informations pratiques, opportunites, evenements, feedbacks et carte Leaflet SSR-safe.
- **Geolocalisation** : marqueurs derives des profils publics, associations approuvees et evenements lies a une association geolocalisee, avec popups et liens de detail.

## Validation

- `npx prisma validate`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

Les migrations Prisma et Supabase sont conservees dans leurs repertoires respectifs. Les actions de moderation necessitent `SUPABASE_SERVICE_ROLE_KEY`, configuree uniquement côté serveur.
