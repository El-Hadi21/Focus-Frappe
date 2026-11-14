# Focus & Frappe

> Application web ludique de rééducation de la frappe au clavier pour les enfants présentant un TDA/H avec dysgraphie, utilisée en séance avec leur ergothérapeute.

**Projet PS6 — TND (TDA/H × dysgraphie)** · Front-end Angular 18 · Back-end Node.js / Express · TypeScript · Playwright E2E · Docker Compose

---

## Sommaire

1. [Présentation](#présentation)
2. [Public visé](#public-visé)
3. [Fonctionnalités](#fonctionnalités)
4. [Le jeu en bref](#le-jeu-en-bref)
5. [Stack technique](#stack-technique)
6. [Structure du dépôt](#structure-du-dépôt)
7. [Installation et lancement (Local & Docker Ops)](#installation-et-lancement-local--docker-ops)
8. [Tests End-to-End (Playwright)](#tests-end-to-end-playwright)
9. [API du back-end](#api-du-back-end)
10. [Organisation du travail](#organisation-du-travail)
11. [Feuille de route](#feuille-de-route)
12. [Crédits et licences](#crédits-et-licences)

---

## Présentation

**Focus & Frappe** est une application web métier conçue pour les séances d'ergothérapie pédiatrique. Elle propose un jeu à thèmes dans lequel l'enfant doit taper un mot au clavier lorsque l'obstacle entre dans une **Zone de Focus**. Le clavier devient un outil de compensation de l'écriture manuscrite, et le jeu travaille simultanément :

- la **motricité fine** et la précision du geste ;
- la **vitesse de frappe** et la mémorisation orthographique ;
- l'**attention soutenue** et le contrôle de l'impulsivité (gestion des frappes précoces hors-fenêtre).

L'application est utilisée **en séance, encadrée par l'ergothérapeute**, qui configure la partie selon le profil clinique de l'enfant, observe son comportement et suit sa progression statistique d'une séance à l'autre.

## Public visé

| Persona | Rôle dans l'application |
|---|---|
| **Claire Martin, 35 ans, ergothérapeute** | Crée les profils des enfants, adapte les paramètres cliniques et sensoriels, ajoute des mots personnalisés, consulte les courbes de progression et consigne ses notes d'observation par séance. |
| **Léo Dubois, 8 ans / Emma Moreau, 10 ans (TDA/H et dysgraphie)** | Choisit son univers (Football ou Espace), joue pendant la séance dans une interface non anxiogène et reçoit un retour positif valorisant à chaque fin de partie. |

## Fonctionnalités

**Espace ergothérapeute**

- Inscription (avec photo de profil) et authentification praticien.
- Tableau de bord avec panneau latéral praticien (*Dernière connexion*, *Dernier patient joué*) et gestion complète des profils enfants (création avec profil clinique, choix parmi 8 avatars thématiques, suppression sécurisée par modale).
- Pré-sélection clinique automatique (`ClinicalDefaultsService`) de la difficulté et de la durée selon la sévérité de la dysgraphie et le profil attentionnel de l'enfant.
- Dictionnaire personnalisé par patient avec validation et classement automatique par longueur (Facile 1–4 lettres, Normal 5–8 lettres, Difficile 9+ lettres).
- Options de confort sensoriel TDA/H (*Effets réduits* coupant les particules, le défilement et les confettis) et contrôle du retour sonore (curseur de volume et mode muet).
- Suivi statistique complet par patient : indicateurs cliniques de la dernière séance, historique global cumulé, 3 courbes de progression SVG interactives (*Score*, *Taux de franchissement*, *Temps de réponse*) et historique daté des notes d'observation clinique par séance.

**Espace jeu & garde-fous TDA/H**

- Deux univers graphiques animés sur `<canvas>` : **Football** et **Espace**.
- Deux modes de frappe : **Mot exact** et **Mot à trous** (lettres masquées selon le palier de difficulté).
- Interface épurée sans télémétrie anxiogène pendant la partie, rappel bienveillant en cas de frappe avant la Zone de Focus, et retour visuel ambré doux (`.is-soft-error`) sans blocage en cas d'erreur de lettre.
- Écran de fin de partie (`GameEnd`) avec animation des étoiles (1 à 3 étoiles), score, pluie de confettis et possibilité de rejouer sur la même séance (agrégation multi-manches) ou de changer d'univers.

## Le jeu en bref

Chaque partie enchaîne des obstacles qui arrivent un par un (1 obstacle toutes les 10 secondes de durée prévue). Pour chacun :

1. **L'obstacle approche** (`APPROACHING`) : une ligne pointillée indique l'entrée de la Zone de Focus. Si l'enfant tape trop tôt, un rappel bienveillant l'invite à patienter.
2. **Il entre dans la Zone de Focus** (`FOCUS`) : le jeu ralentit, la musique de fond baisse automatiquement (ducking audio) et les tuiles du mot à taper apparaissent.
3. **L'enfant tape le mot** au clavier, lettre par lettre.
4. **Résolution** : mot validé à temps → *obstacle franchi* et série incrémentée ; fin de la zone sans validation complète → *obstacle manqué* avec révélation calme du mot.

**Réglages d'une séance**

| Réglage | Valeurs |
|---|---|
| Difficulté | `Facile`, `Normal`, `Difficile` (longueur des mots et durée de la fenêtre de Focus : 7 s / 5,5 s / 4 s) |
| Durée d'une partie | `30`, `60`, `90`, `120`, `150` ou `180` secondes |
| Mode de frappe | `Mot exact`, `Mot à trous` |
| Confort sensoriel | `Effets réduits` (activé / désactivé), volume sonore (`0–100 %` / `Muet`) |
| Thème | `Football`, `Espace` |

## Stack technique

| Couche | Technologies |
|---|---|
| Front-end | Angular 18 (standalone components, Reactive Forms), TypeScript, SCSS, HTML5 `<canvas>`, Web Audio |
| Back-end | Node.js 22, Express, TypeScript, Joi (validation des schémas), Morgan (logs HTTP), CORS |
| Données | Persistance JSON atomique (`backend/database/data/` en exécution et `backend/database/e2e-starter/` pour les tests E2E) |
| Tests E2E | Playwright (`E2EComponentFixture`, Page Object Model, rapports HTML, captures et vidéos) |
| DevOps & CI | Docker (build multi-stage Node + Nginx), Docker Compose V2 (`ops/compose.yml` et `ops/compose-e2e.yml`), GitHub Actions |
| Assets | Packs [Kenney](https://kenney.nl) (CC0), avatars thématiques et effets sonores |

## Structure du dépôt

```text
Focus-Frappe/
├── frontend/                  Application Angular 18 + tests E2E Playwright
│   ├── e2e/                   Configuration E2E, fixtures POM et 5 suites de specs
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/          Modèles et services HTTP (auth, patients, sessions, config)
│   │   │   ├── features/
│   │   │   │   ├── therapist/ Login, register, dashboard, create-profile, hub, config, stats
│   │   │   │   └── game/      EngineCanvas, renderers (foot/space), game-end, audio & télémétrie
│   │   │   └── shared/        Loader et utilitaires de courbes SVG (stats-chart.utils)
│   │   └── environments/      Profils local, docker et docker-e2e
│   ├── Dockerfile             Build multi-stage Angular AOT + Nginx
│   ├── Dockerfile-e2e         Image Playwright d'exécution des tests E2E
│   └── nginx.conf             Configuration SPA Nginx
├── backend/                   API REST Node.js / Express / TypeScript
│   ├── src/                   Routes, contrôleurs, validateurs Joi, modèles et JsonStorageService
│   ├── database/
│   │   ├── data/              Données JSON de l'application
│   │   └── e2e-starter/       Seed déterministe copié dans database/e2e avant chaque test E2E
│   ├── Dockerfile             Image Node.js de production
│   └── Dockerfile-e2e         Image Node.js démarrant en mode isolé (start:e2e)
└── ops/                       Livrable Docker Compose et scripts d'automatisation
    ├── compose.yml            Orchestration de production (Front :8080 / Back :8081)
    ├── compose-e2e.yml        Orchestration isolée des tests E2E (Back + Front + Playwright)
    ├── run.sh                 Script de démarrage de l'application conteneurisée
    ├── run-e2e.sh             Script d'exécution des tests E2E et d'export des rapports/vidéos
    └── full_time_deliverable.md  Documentation détaillée de la stratégie E2E et de l'architecture Ops
```

## Installation et lancement (Local & Docker Ops)

### Option A — Lancement conteneurisé via Docker Compose (recommandé / Ops)

Assurez-vous d'avoir Docker Desktop (avec Docker Compose V2) lancé :

```bash
# 1. Lancer l'application complète (Front sur http://localhost:8080 | Back sur http://localhost:8081)
sh ./ops/run.sh

# 2. Lancer la suite complète de tests E2E Playwright dans Docker
sh ./ops/run-e2e.sh
```

| Service | URL / chemin |
|---|---|
| Application front-end | http://localhost:8080 |
| API back-end et healthcheck | http://localhost:8081/api/status |
| Rapport E2E (HTML) | `ops/e2e-results/playwright-report/index.html` |
| Vidéos et captures E2E | `ops/e2e-results/test-results/` |

### Option B — Lancement en développement local

**1. Démarrer le back-end (port 3000)**

```bash
cd backend
npm install
npm run dev
```

**2. Démarrer le front-end (port 4200)**

```bash
cd frontend
npm install
npm start
```

### Scripts disponibles

| Dossier | Commande | Rôle |
|---|---|---|
| `ops` | `sh ./run.sh` | Démarre les conteneurs back (8081) et front (8080) avec healthchecks |
| `ops` | `sh ./run-e2e.sh` | Exécute les tests E2E conteneurisés et exporte les rapports/vidéos dans `ops/e2e-results/` |
| `frontend` | `npm start` | Serveur de développement Angular (http://localhost:4200) |
| `frontend` | `npm run build` | Compilation Angular dans `dist/focus-frappe` |
| `frontend` | `npx playwright test` | Lance les 5 suites de tests E2E en local |
| `backend` | `npm run dev` | API en mode développement avec rechargement automatique |
| `backend` | `npm run build` | Compilation TypeScript vers `dist/` |
| `backend` | `npm run start:e2e` | Réinitialise `database/e2e` depuis `e2e-starter` et lance l'API isolée |

## Tests End-to-End (Playwright)

La suite E2E (`frontend/e2e/`) valide 11 scénarios répartis en 5 suites couvrant l'ensemble des parcours utilisateurs :

| Suite | Ce qu'elle vérifie |
|---|---|
| `01-auth.spec.ts` | Redirection vers `/login`, rejet d'identifiants invalides, inscription d'un praticien et validation des mots de passe, connexion et déconnexion. |
| `02-dashboard.spec.ts` | Barre latérale praticien, création d'un patient avec avatar, ouverture du hub et suppression via modale. |
| `03-session-config.spec.ts` | Pré-sélection clinique par défaut, changement d'avatar en direct, ajout / auto-classement / suppression de mots personnalisés, options *Mot à trous*, *Effets réduits* et contrôle audio. |
| `04-game-engine.spec.ts` | Sélection d'univers, compte à rebours, absence de télémétrie anxiogène, rappel hors-fenêtre (`APPROACHING`), erreur douce ambrée (`FOCUS`), validation d'obstacle et abandon. |
| `05-stats.spec.ts` | Partie complète de 3 obstacles, écran de victoire 3 étoiles + confettis, graphiques SVG de progression, enregistrement de notes d'observation et mise à jour du *Dernier patient joué*. |

## API du back-end

Toutes les routes sont préfixées par `/api` et validées avec Joi (`backend/src/validators/schemas.ts`).

| Ressource | Routes | Description |
|---|---|---|
| `/health`, `/status` | `GET /` | Sonde de santé (healthcheck Docker) et nombre de patients en base |
| `/auth` | `POST /login`, `POST /register` | Authentification et création de compte praticien |
| `/dictionaries` | `GET /` | Dictionnaires de mots par thème et difficulté |
| `/patients` | `GET /`, `GET /:id`, `POST /`, `DELETE /:id` | CRUD des profils patients |
| `/patients/:id/avatar` | `PATCH /` | Mise à jour instantanée de l'avatar d'un patient |
| `/patients/:id/custom-words` | `POST /`, `DELETE /:word` | Ajout et suppression de mots personnalisés |
| `/patients/:id/sessions` | `GET /`, `POST /` | Historique et enregistrement / agrégation des séances jouées |
| `/patients/:id/sessions/:sessionId/notes` | `PATCH /` | Sauvegarde des notes d'observation clinique d'une séance |
| `/sessions/:sessionId` | `GET /` | Détail d'une séance par son identifiant |

## Organisation du travail

- **Branches** : `main` pour les versions stables (taguée `FINAL`), `dev` pour l'intégration continue, et branches dédiées par fonctionnalité (`feat/...`, `test/...`, `chore/...`).
- **Commits et PR** : [Conventional Commits](https://www.conventionalcommits.org/fr/) (`feat:`, `fix:`, `docs:`, `chore:`, `test:`) associés aux issues et pull requests GitHub.

## Feuille de route

| Epic | Contenu | État |
|---|---|---|
| Maquette | Parcours et pages principales en HTML/CSS/JS | Terminé |
| E1 — Front-end | Application Angular 18, moteur de jeu `<canvas>`, thèmes, statistiques SVG | Terminé |
| E2 — Back-end | API Node.js/Express, persistance JSON atomique, validation Joi | Terminé |
| E3 & E4 — Expérience & audio | Mise en scène canvas, effets visuels, confort sensoriel TDA/H, système audio Web | Terminé |
| E5 — Qualité E2E & DevOps | Suite complète Playwright (5 suites) et conteneurisation Docker Compose (`ops/`) | Terminé |

## Crédits et licences

- Assets graphiques et sons : packs [Kenney](https://kenney.nl) (licence CC0).
- Avatars des profils : images générées pour le projet.
- Projet réalisé dans le cadre du PS6.

## Auteur

**El-Hadi** — [@El-Hadi21](https://github.com/El-Hadi21)