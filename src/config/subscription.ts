/**
 * Réglages de l'essai gratuit et de l'abonnement du Carnet de sport.
 *
 * Modèle « Les Carnets » : essai gratuit 14 jours (tout inclus), puis
 * abonnement par carnet ou global. Le paiement (souscription ET gestion) est
 * centralisé sur la vitrine ; le carnet y redirige. Tant que `ENFORCE_TRIAL`
 * est `false`, on ne bloque personne.
 */

/**
 * Identifiant de ce carnet dans le modèle d'abonnement par carnet.
 * Un abonnement débloque ce carnet si son `plan` vaut ce carnet ou `all`.
 */
export const CARNET = 'sport'

/** Durée de l'essai gratuit, en jours (aligné sur les autres carnets). */
export const TRIAL_DURATION_DAYS = 14

/**
 * Quand `false`, l'accès reste ouvert à tous même après l'essai. Passer à
 * `true` (dans les 3 carnets, le jour du lancement du paiement) pour
 * verrouiller l'app à la fin de l'essai, sauf abonnés à ce carnet ou au global.
 */
export const ENFORCE_TRIAL = true
