# Focus & Frappe

> Un jeu de frappe au clavier pour aider les enfants TDA/H avec dysgraphie, utilisé en séance avec leur ergothérapeute.

**Projet PS6 — TND (TDA/H × dysgraphie)** · Front-end Angular 18 · Back-end Node.js / Express · TypeScript

---

## Sommaire

1. [Présentation](#présentation)
2. [Public visé](#public-visé)
3. [Fonctionnalités](#fonctionnalités)
4. [Le jeu en bref](#le-jeu-en-bref)
5. [Stack technique](#stack-technique)
6. [Structure du dépôt](#structure-du-dépôt)
7. [Installation et lancement](#installation-et-lancement)
8. [API du back-end](#api-du-back-end)
9. [Organisation du travail](#organisation-du-travail)
10. [Feuille de route](#feuille-de-route)
11. [Crédits et licences](#crédits-et-licences)

---

## Présentation

**Focus & Frappe** est une application web métier. Elle propose un jeu à thèmes dans lequel l'enfant doit taper un mot au clavier pour franchir des obstacles. Le clavier devient un outil de compensation de l'écriture manuscrite, et le jeu travaille en même temps :

- la **motricité fine** et la précision du geste ;
- la **vitesse de frappe** ;
- l'**attention soutenue**.

L'application n'est pas un jeu grand public : elle est utilisée **en séance, encadrée par l'ergothérapeute**, qui configure la partie, suit la progression de l'enfant et lit ses statistiques.

Le projet suit une démarche centrée utilisateur : besoins, personas, scénarios, maquettes, puis code.

## Public visé

| Persona | Rôle dans l'application |
|---|---|
| **Claire, 34 ans, ergothérapeute** | Crée les profils des enfants, configure les séances, consulte le tableau de bord. |
| **Léo, 10 ans, TDA/H et dysgraphie** | Joue pendant la séance et reçoit un retour positif à chaque partie. |

## Fonctionnalités

**Espace ergothérapeute**
- Inscription et connexion.
- Liste des profils patients, création, suppression.
- Choix d'un avatar pour chaque enfant, modifiable ensuite.
- Configuration de séance : difficulté, durée de la partie, mode d'exercice, thème.
- Mots personnalisés par profil, ajoutés par l'ergothérapeute en plus des dictionnaires de base.
- Tableau de bord par patient : dernière séance et historique global.

**Espace jeu**
- Deux thèmes : **Football** et **Espace**.
- Deux modes d'exercice : mot exact et mot à trous (l'enfant tape le mot complet et doit deviner les lettres manquantes).
- Écran de fin de partie avec retour positif, puis choix entre rejouer et revenir au profil.

## Le jeu en bref

Chaque partie enchaîne des obstacles qui arrivent un par un. Pour chacun :

1. **L'obstacle approche** à vitesse normale.
2. **Il entre dans la zone de focus** : le jeu ralentit, et un mot apparaît.
3. **L'enfant tape le mot** au clavier.
4. **Résolution** : mot validé dans la zone, c'est *franchi* ; zone terminée sans validation, c'est *manqué*. Une faute de frappe ne fait pas échouer l'obstacle.

Chaque thème propose deux obstacles qui alternent automatiquement (par exemple, au football : une balle à renvoyer au but, ou un adversaire qui porte le ballon). Ils suivent la même boucle mesurée, ce qui garantit que les données restent comparables d'un thème à l'autre.

**Réglages d'une séance**

| Réglage | Valeurs |
|---|---|
| Difficulté | Facile, Normal, Difficile (longueur des mots et durée du ralenti) |
| Durée d'une partie | De 30 à 180 secondes, par pas de 30 s |
| Mode d'exercice | Mot exact, mot à trous |
| Thème | Football, Espace |

**Indicateurs enregistrés** : temps de réponse par mot, obstacles franchis et manqués, série maximale, frappes hors fenêtre de focus, erreurs de frappe, durée jouée sur durée prévue. Les données brutes sont stockées ; les statistiques sont calculées à l'affichage.

## Stack technique

| Couche | Technologies |
|---|---|
| Front-end | Angular 18 (composants standalone), TypeScript, SCSS, rendu du jeu sur `<canvas>` |
| Back-end | Node.js, Express, TypeScript, Joi (validation), Morgan (logs), CORS |
| Données | Fichiers JSON (`backend/database/data`) |
| Tests | Playwright (script `test:e2e`) |
| CI | GitHub Actions (`.github/workflows/ci.yml`) |
| Assets | Packs [Kenney](https://kenney.nl) (CC0), avatars générés |

## Structure du dépôt

```
Focus-Frappe/
├── frontend/              Application Angular
│   └── src/
│       ├── app/
│       │   ├── core/          Modèles et services (patients, sessions, configuration)
│       │   ├── features/
│       │   │   ├── therapist/ Connexion, dashboard, profils, configuration, statistiques
│       │   │   └── game/      Moteur, renderers par thème, écran de fin, services de jeu
│       │   └── shared/        Composants et utilitaires partagés
│       └── assets/            Thèmes (foot, space), UI Kenney, avatars
├── backend/               API Node.js / Express
│   ├── src/                   Routes, contrôleurs, validateurs, modèles, services
│   └── database/data/         Données JSON (patients, sessions, dictionnaires...)
├── maquette/              Maquette HTML/CSS/JS des pages principales
└── maquette-jeu-main/     Maquette de l'écran de jeu
```

## Installation et lancement

### Prérequis

- [Node.js](https://nodejs.org) (version LTS récente) et npm
- Git

### 1. Cloner le dépôt

```bash
git clone https://github.com/El-Hadi21/Focus-Frappe.git
cd Focus-Frappe
git checkout dev
```

### 2. Lancer le back-end

```bash
cd backend
npm install
npm run dev
```

L'API démarre sur **http://localhost:3000**. Le port se change avec la variable d'environnement `PORT`.

### 3. Lancer le front-end

Dans un second terminal :

```bash
cd frontend
npm install
npm start
```

L'application est disponible sur **http://localhost:4200**.

> Le front-end appelle l'API sur `http://localhost:3000` et le back-end n'autorise que l'origine `http://localhost:4200`. Lancez donc les deux serveurs avec ces ports.

### Scripts utiles

| Dossier | Commande | Rôle |
|---|---|---|
| `frontend` | `npm start` | Serveur de développement Angular |
| `frontend` | `npm run build` | Build de production |
| `frontend` | `npm run test:e2e` | Tests Playwright |
| `backend` | `npm run dev` | API en mode développement (rechargement automatique) |
| `backend` | `npm run build` | Compilation TypeScript vers `dist/` |
| `backend` | `npm start` | Lance l'API compilée |

## API du back-end

Toutes les routes sont préfixées par `/api`.

| Ressource | Routes |
|---|---|
| `/auth` | `POST /login`, `POST /register` |
| `/dictionaries` | `GET /` |
| `/patients` | `GET /`, `GET /:id`, `POST /`, `DELETE /:id` |
| | `PATCH /:id/avatar` |
| | `POST /:id/custom-words`, `DELETE /:id/custom-words/:word` |
| | `GET /:id/sessions`, `POST /:id/sessions` |
| `/sessions` | `GET /:sessionId` |

Les corps de requête sont validés avec Joi (`backend/src/validators/schemas.ts`).

## Organisation du travail

- **Branches** : `main` pour les versions stables, `dev` pour l'intégration. Chaque fonctionnalité se développe dans une branche `feat/...` créée depuis `dev`.
- **Commits** : [Conventional Commits](https://www.conventionalcommits.org/fr/) (`feat:`, `fix:`, `docs:`, `refactor:`...).
- **Suivi** : jalons (milestones) par epic, issues par jalon, sous-issues par tâche, tableau GitHub Projects.
- **Livraison** : une pull request par jalon vers `dev`.

## Feuille de route

| Epic | Contenu | État |
|---|---|---|
| Maquette | Parcours et pages principales en HTML/CSS/JS | Fait |
| E1 — Front-end | Application Angular, moteur de jeu, thèmes, statistiques | Fait |
| E2 — Back-end | API Node.js, persistance JSON, validation | En place |
| E4 — Amélioration du jeu | Visuel et mise en scène (`feat/gameplay-engine`), système audio (`feat/audio-system`) | En cours |

**Idées futures** : code PIN pour quitter le jeu, tolérance aux fautes de frappe proches, complexité phonétique des mots, thèmes supplémentaires.

## Crédits et licences

- Assets graphiques et sons : packs [Kenney](https://kenney.nl) (licence CC0).
- Avatars des profils : images générées pour le projet.
- Projet réalisé dans le cadre du PS6.

## Auteur

**El-Hadi** — [@El-Hadi21](https://github.com/El-Hadi21)