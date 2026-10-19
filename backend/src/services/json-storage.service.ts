import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { DatabaseSchema, Practitioner } from '../models/database.model';
import { Patient } from '../models/patient.model';
import { SessionStats } from '../models/session-stats.model';

const DEFAULT_DATA_DIRECTORY = resolve(process.cwd(), 'database/data');

const initialPractitioners: Practitioner[] = [
  {
    id: 'practitioner-claire',
    firstName: 'Claire',
    lastName: 'Martin',
    email: 'ergo@focus-frappe.fr',
    password: 'ergo123',
    age: 35,
    profilePicture: '',
  },
];

const initialPatients: Patient[] = [
  {
    id: 'patient-leo',
    firstName: 'Léo',
    lastName: 'Martin',
    age: 8,
    dysgraphiaSeverity: 'Légère',
    attentionProfile: 'Inattentif',
  },
  {
    id: 'patient-ines',
    firstName: 'Inès',
    lastName: 'Bernard',
    age: 10,
    dysgraphiaSeverity: 'Modérée',
    attentionProfile: 'Mixte',
  },
  {
    id: 'patient-noah',
    firstName: 'Noah',
    lastName: 'Petit',
    age: 9,
    dysgraphiaSeverity: 'Sévère',
    attentionProfile: 'Hyperactif',
  },
];

const initialSessions: Record<string, SessionStats[]> = {
  'patient-leo': [
    {
      id: 'session-leo-01',
      date: '2026-09-15T16:00:00.000Z',
      gamesCount: 3,
      config: { difficulty: 'Facile', durationSeconds: 60, mode: 'Mot exact', theme: 'Football' },
      avgResponseTimeSec: 3.4,
      variabilityMinSec: 2.5,
      variabilityMaxSec: 4.3,
      obstaclesCleared: 8,
      obstaclesMissed: 4,
      outOfWindowClicks: 6,
      typingErrors: 9,
      maxStreak: 5,
      playedDurationSec: 150,
      plannedDurationSec: 180,
      abandons: 1,
      score: 500,
      notes: 'Bonne compréhension de la consigne, attention fluctuante en fin de séance.',
    },
    {
      id: 'session-leo-02',
      date: '2026-09-24T16:15:00.000Z',
      gamesCount: 4,
      config: { difficulty: 'Facile', durationSeconds: 90, mode: 'Mot à trous', theme: 'Espace' },
      avgResponseTimeSec: 3.1,
      variabilityMinSec: 2.4,
      variabilityMaxSec: 3.8,
      obstaclesCleared: 11,
      obstaclesMissed: 4,
      outOfWindowClicks: 5,
      typingErrors: 8,
      maxStreak: 7,
      playedDurationSec: 270,
      plannedDurationSec: 360,
      abandons: 1,
      score: 750,
    },
    {
      id: 'session-leo-03',
      date: '2026-10-02T15:45:00.000Z',
      gamesCount: 5,
      config: { difficulty: 'Normal', durationSeconds: 90, mode: 'Mot exact', theme: 'Football' },
      avgResponseTimeSec: 2.9,
      variabilityMinSec: 2.2,
      variabilityMaxSec: 3.6,
      obstaclesCleared: 13,
      obstaclesMissed: 3,
      outOfWindowClicks: 4,
      typingErrors: 6,
      maxStreak: 9,
      playedDurationSec: 390,
      plannedDurationSec: 450,
      abandons: 0,
      score: 1000,
    },
    {
      id: 'session-leo-04',
      date: '2026-10-08T16:30:00.000Z',
      gamesCount: 5,
      config: { difficulty: 'Normal', durationSeconds: 120, mode: 'Mot à trous', theme: 'Espace' },
      avgResponseTimeSec: 2.6,
      variabilityMinSec: 2,
      variabilityMaxSec: 3.2,
      obstaclesCleared: 16,
      obstaclesMissed: 3,
      outOfWindowClicks: 3,
      typingErrors: 5,
      maxStreak: 11,
      playedDurationSec: 510,
      plannedDurationSec: 600,
      abandons: 0,
      score: 1250,
      notes: 'Progression régulière et meilleure tolérance aux mots à trous.',
    },
    {
      id: 'session-leo-05',
      date: '2026-10-13T14:30:00.000Z',
      gamesCount: 5,
      config: { difficulty: 'Difficile', durationSeconds: 120, mode: 'Mot exact', theme: 'Football' },
      avgResponseTimeSec: 2.4,
      variabilityMinSec: 1.8,
      variabilityMaxSec: 3,
      obstaclesCleared: 14,
      obstaclesMissed: 2,
      outOfWindowClicks: 2,
      typingErrors: 4,
      maxStreak: 10,
      playedDurationSec: 540,
      plannedDurationSec: 600,
      abandons: 0,
      score: 1500,
      notes: 'Léo reste concentré et gagne en vitesse. Les erreurs surviennent surtout lors des changements de rythme.',
    },
  ],
  'patient-ines': [],
  'patient-noah': [],
};

const initialDictionaries: Record<string, Record<string, string[]>> = {
  Football: {
    Facile: ['but', 'tir', 'jeu', 'foot', 'club', 'main', 'camp', 'gant', 'coup', 'hors'],
    Normal: ['ballon', 'gardien', 'arbitre', 'terrain', 'dribble', 'joueur', 'corner', 'stade', 'maillot', 'crampon'],
    Difficile: ['defenseur', 'attaquant', 'entraineur', 'championnat', 'coequipier', 'prolongation', 'supporter'],
  },
  Espace: {
    Facile: ['lune', 'mars', 'ciel', 'ovni', 'star', 'vol', 'vide', 'base', 'nuit', 'noir'],
    Normal: ['planete', 'comete', 'galaxie', 'cosmos', 'navette', 'orbite', 'etoile', 'station', 'soleil', 'pilote'],
    Difficile: ['astronaute', 'meteorite', 'apesanteur', 'exploration', 'observatoire', 'constellation', 'telescope'],
  },
};

export class JsonStorageService {
  private readonly practitionersPath: string;
  private readonly patientsPath: string;
  private readonly sessionsPath: string;
  private readonly dictionariesPath: string;

  constructor(private readonly dataDirectory = DEFAULT_DATA_DIRECTORY) {
    this.practitionersPath = resolve(dataDirectory, 'practitioners.json');
    this.patientsPath = resolve(dataDirectory, 'patients.json');
    this.sessionsPath = resolve(dataDirectory, 'sessions.json');
    this.dictionariesPath = resolve(dataDirectory, 'dictionaries.json');
  }

  async initialize(): Promise<void> {
    await mkdir(this.dataDirectory, { recursive: true });

    await Promise.all([
      this.ensureFile(this.practitionersPath, initialPractitioners),
      this.ensureFile(this.patientsPath, initialPatients),
      this.ensureFile(this.sessionsPath, initialSessions),
      this.ensureFile(this.dictionariesPath, initialDictionaries),
    ]);

    await this.removeLegacyDatabase();
  }

  async getPractitioners(): Promise<Practitioner[]> {
    return this.readFile(this.practitionersPath);
  }

  async savePractitioners(practitioners: Practitioner[]): Promise<void> {
    await this.writeFile(this.practitionersPath, practitioners);
  }

  async getPatients(): Promise<Patient[]> {
    return this.readFile(this.patientsPath);
  }

  async getPatientById(id: string): Promise<Patient | undefined> {
    const patients = await this.getPatients();
    return patients.find((patient) => patient.id === id);
  }

  async savePatients(patients: Patient[]): Promise<void> {
    await this.writeFile(this.patientsPath, patients);
  }

  async savePatient(patient: Patient): Promise<void> {
    const patients = await this.getPatients();
    const patientIndex = patients.findIndex((item) => item.id === patient.id);

    if (patientIndex === -1) {
      throw new Error(`Patient introuvable: ${patient.id}`);
    }

    patients[patientIndex] = patient;
    await this.savePatients(patients);
  }

  async getDictionaries(): Promise<Record<string, Record<string, string[]>>> {
    return this.readFile(this.dictionariesPath);
  }

  async getSessionsByPatient(): Promise<Record<string, SessionStats[]>> {
    return this.readFile(this.sessionsPath);
  }

  async saveSessionsByPatient(sessionsByPatient: Record<string, SessionStats[]>): Promise<void> {
    await this.writeFile(this.sessionsPath, sessionsByPatient);
  }

  async getDatabase(): Promise<DatabaseSchema> {
    const [practitioners, patients, sessionsByPatient] = await Promise.all([
      this.getPractitioners(),
      this.getPatients(),
      this.getSessionsByPatient(),
    ]);

    return { practitioners, patients, sessionsByPatient };
  }

  private async ensureFile<T>(path: string, seed: T): Promise<void> {
    try {
      const content = await readFile(path, 'utf8');
      if (content.trim().length === 0) {
        await this.writeFile(path, seed);
      }
    } catch (error: unknown) {
      if (!isFileNotFoundError(error)) {
        throw error;
      }

      await this.writeFile(path, seed);
    }
  }

  private async readFile<T>(path: string): Promise<T> {
    const content = await readFile(path, 'utf8');
    return JSON.parse(content) as T;
  }

  private async writeFile<T>(path: string, value: T): Promise<void> {
    const temporaryPath = `${path}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    await rename(temporaryPath, path);
  }

  private async removeLegacyDatabase(): Promise<void> {
    const legacyPath = resolve(this.dataDirectory, '../../data/db.json');

    try {
      await unlink(legacyPath);
    } catch (error: unknown) {
      if (!isFileNotFoundError(error)) {
        throw error;
      }
    }
  }
}

function isFileNotFoundError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT';
}
