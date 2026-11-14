# Stratégie de Test — Focus & Frappe

---

## 1. Approche globale

Notre stratégie de test a été conçue pour servir de véritable **"Ceinture de Sécurité"** à notre application d'ergothérapie pédiatrique avant les séances avec de véritables enfants et ergothérapeutes.

Nous utilisons **Playwright** pour réaliser des tests **E2E (End-to-End)**. Notre approche est hybride :

> *"Unitaire du point de vue IHM, mais de bout en bout techniquement."*

Concrètement, chaque scénario de test débute toujours par la **page de connexion** (pour simuler un vrai parcours praticien et vérifier le routing), puis se concentre sur la validation granulaire et exhaustive d'une interface ou d'une mécanique précise avec une base JSON réinitialisée (`e2e-starter` vers `database/e2e`). Cette méthode garantit une confiance totale (**TRUST**) dans notre code lors des refactorisations.

**Choix techniques :**

- **Design pattern :** Page Object Model (POM) via l'héritage de `E2EComponentFixture`
- **Fixtures (`.fixture.ts`) :** extraction de la logique de sélection du DOM dans des classes dédiées (`AuthFixture`, `DashboardFixture`, `SessionConfigFixture`, `GameEngineFixture`, `StatsEndgameFixture`)
- **Scénarios (`.spec.ts`) :** structurés avec des `test.step` pour une meilleure traçabilité en cas d'échec

---

## 2. Scénarios de Test (User Flows)

Nos tests automatisés couvrent les parcours vitaux de l'application, répartis en deux grands espaces : l'espace Ergothérapeute et l'espace Gameplay Enfant.

---

### A. Parcours de l'Écosystème Ergothérapeute

> **Objectif :** s'assurer que les praticiens peuvent gérer leurs patients et préparer les séances sans aucun blocage.

#### Scénario A1 — Authentification et Compte Praticien (`01-auth.spec.ts`)

| | |
|---|---|
| **Parcours** | `/` → `/login` → `/register` → `/dashboard` |
| **Vérifications** | Redirection par défaut, validation des erreurs d'identifiants, inscription d'un nouveau praticien avec avatar, connexion réussie et déconnexion |

#### Scénario A2 — Dashboard, Sidebar Persona et Profils Patients (`02-dashboard-profiles.spec.ts`)

| | |
|---|---|
| **Parcours** | `/dashboard` → `/create-profile` → `/patient/:id` |
| **Vérifications** | Vérification du panneau latéral praticien (Claire Martin), création d'un profil enfant (Lucas Bernard) avec choix parmi les 8 avatars, ouverture du Hub patient et suppression sécurisée via modale (Annuler puis Confirmer) |

#### Scénario A3 — Configuration Clinique, Dictionnaire Personnalisé et Confort Sensoriel (`03-session-config.spec.ts`)

| | |
|---|---|
| **Parcours** | `/dashboard` → `/patient/:id` → `/configuration/:id` |
| **Vérifications** | Pré-remplissage intelligent par défaut selon le profil clinique (`ClinicalDefaultsService`), changement rapide d'avatar, ajout/validation/auto-classement et suppression de mots personnalisés, activation des options *Mot à trous*, *Effets réduits* (TDA/H) et contrôle audio |

---

### B. Parcours du Gameplay Enfant et Suivi Clinique

> **Objectif :** simuler une séance de rééducation sur le moteur Canvas/DOM et vérifier que l'application reste bienveillante, non punitive et trace fidèlement la télémétrie.

#### Scénario B1 — Moteur de Gameplay et Garde-fous TDA/H (`04-gameplay-engine.spec.ts`)

| | |
|---|---|
| **Parcours** | `/configuration/:id` → `/game-session` (Sélection de thème → Compte à rebours → Approche → Zone de Focus) |
| **Vérifications** | Sélection dynamique d'univers (Football / Espace), HUD épuré sans statistiques anxiogènes, rappel bienveillant en cas de frappe précoce (`APPROACHING`), erreur douce ambrée (`.is-soft-error`) sans secousse en `FOCUS`, validation d'un mot complet et abandon sécurisé en cours de partie |

#### Scénario B2 — Fin de Partie (`GameEnd`) et Tableau de Bord Statistique (`05-endgame-stats.spec.ts`)

| | |
|---|---|
| **Parcours** | Manche complète (30 s / 3 obstacles) → `/game-end/:sessionId` → `/stats/:id` → `/dashboard` |
| **Vérifications** | Victoire complète (3/3 obstacles franchis), affichage des 3 étoiles et du score final (+750 pts), consultation des statistiques cliniques et bascule des 3 courbes SVG (Score, Taux de franchissement, Temps de réponse), sauvegarde des notes d'observation clinique et mise à jour du *"Dernier patient joué"* sur le Dashboard |

---

# OPS Deliverable - Focus & Frappe

## Architecture

Le projet est composé de 3 conteneurs orchestrés via Docker Compose :

| Service    | Image de base      | Port interne | Port exposé |
|------------|--------------------|--------------|-------------|
| back       | node:22.14-alpine  | 3000         | 8081        |
| front      | nginx:alpine       | 80           | 8080        |
| playwright | mcr playwright     | -            | -           |

## Healthchecks

### Backend
- Endpoint : GET http://localhost:3000/api/status
- Interval : 30s
- Timeout : 10s
- Retries : 3

### Frontend
- Endpoint : GET http://localhost/
- Interval : 30s
- Timeout : 10s
- Retries : 3

## Variables d'environnement

### Build vs Runtime
Le frontend Angular compile les URLs dans le bundle JS au moment
du build (`ng build --configuration=$ENVIRONMENT`).
Il est donc impossible de changer l'URL du backend au runtime.

| Configuration  | apiUrl                     | Usage              |
|----------------|----------------------------|--------------------|
| docker         | http://localhost:8081/api  | Run normal         |
| docker-e2e     | http://back-e2e:3000/api   | Tests e2e          |

Dans `docker-e2e`, les conteneurs communiquent par nom de service
Docker Compose (`back-e2e`, `front-e2e`), jamais via `localhost`.

## Lancer l'application

### Run normal
```bash
chmod +x ops/run.sh
./ops/run.sh
