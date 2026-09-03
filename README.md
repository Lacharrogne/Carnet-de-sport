# 🏃 Carnet de sport

Votre forme, enfin suivie : planifiez vos séances, suivez vos progrès et gardez
le rythme. Un carnet d'entraînement clair qui vous motive sans vous juger.

Fait partie de l'écosystème **[Les Carnets](https://lescarnets.app)** (un seul
compte, un seul abonnement débloque tous les carnets). Identité : azur, **thème
sombre** (le seul carnet en sombre).

> Déployé sur **sport.lescarnets.app**.

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** (tokens `@theme` maison — azur / slate, sombre)
- **Supabase** (Postgres + Auth), backend central partagé « Les Carnets »
- **react-router-dom**
- Icônes en **SVG inline** (pas de lucide dans ce carnet)

## Démarrer en local

```bash
npm install
npm run dev
```

Variables d'environnement requises (fichier `.env.local`) :

```bash
VITE_SUPABASE_URL=...        # projet Supabase « Les Carnets »
VITE_SUPABASE_ANON_KEY=...
```

```bash
npm run build     # tsc -b && vite build
npm run lint
```

## Fonctionnalités

**Pages**
- Tableau de bord · Séances (liste / détail / nouvelle / édition)
- Progrès · Modèles de séance · Corps (mensurations & poids)
- Planning · Défis · Profil · Outils

**Gamification & analyse**
- **XP & niveaux**, **séries (streaks)**, **missions du jour**, objectif hebdo
- **Records personnels**, **surcharge progressive + 1RM estimé**
- **Équilibre musculaire**, progression par exercice
- Estimation **calories (MET)**, comparaison de périodes
- Graphes de tendance / hebdomadaires, calendrier d'activité
- Profil santé, bibliothèque d'exercices, modèles de séance, mode démo

## Accès & abonnement

- Essai gratuit **14 jours** (depuis la création du compte), puis abonnement
  requis. Verrou piloté par `ENFORCE_TRIAL` dans `src/config/subscription.ts`
  (actuellement `true`).
- Accès résolu à partir de la table partagée `subscriptions`. **Souscription et
  gestion centralisées** sur le Hub de la vitrine (`lescarnets.app/#hub`) ; ce
  carnet ne fait qu'y rediriger.

## Conventions du dépôt

- **Pas de dialogues natifs** : utiliser le `DialogProvider`
  (`confirm`/`prompt`/`alert` stylés, accessibles), jamais `window.confirm`.
- **Stockage** : upsert + nettoyage ciblé (`.not('id','in',…)`), **jamais**
  « tout supprimer puis réinsérer » — ce motif a déjà causé des pertes de
  données ici.
- **Pas de colonne écrite sans migration** : un champ envoyé à Supabase doit
  exister en base (un ajout de colonnes fantômes a fait échouer toutes les
  insertions par le passé).
- **Grilles mobiles** : colonnes définies (`grid-cols-1`…), jamais un `grid` nu.
- **Brouillons** : la saisie de séance est persistée en `localStorage`
  (expiration 12 h) pour ne rien perdre en changeant d'app sur mobile.
- **PWA** : `beforeinstallprompt` capté au chargement du module
  (`src/lib/installPrompt.ts`), pas dans un `useEffect`.

## Base de données

Ce carnet **n'a pas de migrations locales** : tout le schéma sport (et ses
extensions — poids corporel, modèles de séance, etc.) est versionné dans le
socle central du dépôt **vitrine-carnet**.

## Écosystème

📔 Vue d'ensemble de l'architecture partagée, du modèle d'accès et des
garde-fous communs : **`ARCHITECTURE.md`** dans le dépôt
[vitrine-carnet](https://github.com/Lacharrogne/vitrine-carnet).
