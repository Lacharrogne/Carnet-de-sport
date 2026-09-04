# Journal des changements — Carnet de sport 🏃

Main courante du carnet : **ce qui a été fait, quand, et pourquoi**.
Ordre antéchronologique (le plus récent en haut).

> Chaque modification est consignée ici **dans le même commit** que le
> changement. Voir `CLAUDE.md` pour le format et la règle.
>
> Ce journal démarre le 2026-08-23 ; l'historique antérieur est dans `git log`.

---

## 2026-09-04

### Démarrage allégé : les pages se chargent à la demande

- **Ce qui change** : les treize pages ne sont plus embarquées dans un seul
  fichier — chacune est téléchargée au moment où l'on s'y rend. Le JavaScript
  chargé à l'ouverture passe de **693 Ko à 477 Ko (−31 %)**, réparti en 24
  morceaux. Un court squelette (`PageLoader`) occupe l'espace pendant le
  chargement d'une page.
- **Pourquoi** : c'était le carnet le plus lourd à démarrer, alors que c'est
  celui qu'on ouvre à la salle, souvent en 4G médiocre. Les deux autres carnets
  procédaient déjà ainsi.
- **À savoir** : les 477 Ko restants sont essentiellement le code des
  bibliothèques (React, react-router, `@supabase/supabase-js`), nécessaires dès
  le démarrage pour l'authentification — il n'y a plus de gain facile de ce
  côté. Les données de démonstration, elles, ne pèsent que 7 Ko au total.

### Un abonné payant ne peut plus être bloqué par une panne de lecture

- **Ce qui change** : `getSubscription()` distingue désormais **« lecture
  réussie »** de **« lecture en échec »** (au lieu de renvoyer `null` dans les
  deux cas) et réessaie deux fois avant d'abandonner. La décision d'accès passe
  par une fonction pure, `decideEntitlement()`, qui **laisse entrer** quand
  l'abonnement n'a pas pu être lu, et se rabat sur le dernier statut connu
  mémorisé localement.
- **Pourquoi** : une simple coupure réseau suffisait à faire passer un client
  qui paie pour un non-abonné ; l'essai étant terminé, il se retrouvait devant
  l'écran « essai terminé », dehors.
- **À savoir** : principe retenu — **on ne verrouille jamais sur un doute**.
  L'entitlement expose un indicateur `degraded` quand la décision repose sur ce
  repli, pour permettre plus tard un bandeau discret plutôt qu'un mur.

### Intégration continue (CI)

- **Ce qui change** : ajout d'un workflow GitHub Actions qui, sur chaque PR et
  sur `main`, installe les dépendances, passe le lint, (pas encore de tests) et vérifie que le
  build compile. Un second job **refuse toute PR qui touche à `src/` ou
  `supabase/` sans mettre à jour `CHANGELOG.md`**.
- **Pourquoi** : aucun dépôt n'avait de CI — rien n'empêchait de fusionner une
  PR qui casse le build, et la main courante ne tenait que par la discipline.
- **À savoir** : le lint est **non bloquant** pour l'instant (`continue-on-error`),
  car il remonte des erreurs préexistantes. Le rendre bloquant une fois
  celles-ci corrigées, en retirant cette ligne du workflow.

### Mise en place de la main courante

- **Ce qui change** : ajout de ce `CHANGELOG.md` et d'un `CLAUDE.md` qui fixe
  les règles de travail du dépôt (dont l'obligation de tenir ce journal).
- **Pourquoi** : garder une trace précise des décisions, afin qu'une session
  future — sans le contexte de celle qui a fait le changement — sache ce qui a
  déjà été fait et pourquoi.

### Audit technique : ouverture des tickets

- **Ce qui change** : les constats de l'audit sont suivis en issues
  (#26 entitlement, #27 bundle non découpé, #28 mensurations non synchronisées,
  #29 CI, tests et `.env`).
- **À savoir** : ce carnet a le **bundle le plus lourd** (692 Ko, sans `lazy()`)
  alors que c'est celui qu'on ouvre en 4G à la salle. Voir le tableau de bord
  [vitrine-carnet#10](https://github.com/Lacharrogne/vitrine-carnet/issues/10).

## 2026-09-03

### Vrai README (#25)

- **Ce qui change** : le README d'exemple généré par Vite est remplacé par une
  vraie présentation du carnet (stack, démarrage, fonctionnalités, conventions).

### L'invite d'installation ne s'affichait pas sur PC (#24)

- **Ce qui change** : `beforeinstallprompt` est capté dès le chargement du
  module (`src/lib/installPrompt.ts`), et non plus dans un `useEffect`.
- **Pourquoi** : sur ordinateur, l'événement se déclenche **avant** le montage
  du composant React — le listener le ratait, et la bannière n'apparaissait
  jamais.

## 2026-09-01

### Fenêtres in-app à la place des boîtes natives (#23)

- **Ce qui change** : les `window.confirm` / `prompt` / `alert` sont remplacés
  par un `DialogProvider` (fenêtres stylées, accessibles, sur promesses).
- **Pourquoi** : les boîtes natives étaient laides et hors identité (thème
  sombre).

### Échec d'enregistrement des séances (#22)

- **Ce qui change** : retrait des champs `source` et `external_id` envoyés à
  Supabase.
- **Pourquoi** : ces colonnes avaient été ajoutées côté front lors d'une
  intégration Strava **sans migration SQL** — elles n'existaient pas en base,
  donc **toute insertion de séance échouait**.
- **À savoir** : garde-fou permanent — ne jamais écrire un champ qui n'existe
  pas en base.

### Brouillon automatique de nouvelle séance (#21)

- **Ce qui change** : la saisie en cours est sauvegardée en `localStorage`
  (expiration 12 h).
- **Pourquoi** : sur téléphone, aller consulter ses notes entre deux exercices
  effaçait toute la séance en cours de saisie.

### Suppression de séance fiable (#20)

- **Ce qui change** : le motif « tout supprimer puis réinsérer » est remplacé
  par un **upsert + nettoyage ciblé** ; les messages d'erreur deviennent clairs
  et ne renvoient plus à la console.
- **Pourquoi** : supprimer une séance affichait une erreur et **risquait de
  détruire des données**.
- **À savoir** : garde-fou permanent — jamais de « nuke-and-repave » sur le
  stockage.

## 2026-08-30 → 08-31

### Mobile : fin du scroll horizontal et du dézoom (#19)

- **Ce qui change** : `grid-cols-1` appliqué à toutes les grilles mono-colonne.
- **À savoir** : garde-fou permanent — ne jamais laisser un `grid` nu.

### Mobile : fondu en haut du menu ouvert (#18)

## 2026-08-29

### Encoche et barre d'accueil iOS (#17)

- **Ce qui change** : prise en compte des `safe-area` sur l'en-tête et la
  bannière d'installation.

## 2026-08-28

### L'app devient installable (#16)

- **Ce qui change** : icônes 192/512 + maskable, `apple-touch-icon` opaque,
  raccourcis manifest, bannière « Installer l'application ».

## 2026-08-27

### Sous-titre masqué sur petit écran (#15)

- **Pourquoi** : « Suivi sportif & motivation » était tronqué sous `sm`.

### Page-hub « Outils » (#14)

## 2026-08-23

### Boutons de la carte « prochaine séance » (#12, #13)

- **Ce qui change** : forme et centrage corrigés.
