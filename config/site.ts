// Source de vérité unique pour les informations globales du site.
// Toute UI qui a besoin d'afficher la version du prototype (footer, badges…)
// doit importer `SITE_VERSION` d'ici plutôt que de la recopier en dur —
// on ne veut jamais avoir à mettre à jour ce numéro à plusieurs endroits.
//
// SITE_VERSION est dérivé de package.json (seule source réellement tenue
// à jour, ex: `npm version`) plutôt que dupliqué en dur ici — voir la
// recommandation de centralisation faite avant cette task.
import packageJson from "../package.json";

export const SITE_NAME = "GabonConnect";
export const SITE_VERSION = packageJson.version;