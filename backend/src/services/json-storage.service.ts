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
    email: process.env.DEFAULT_ERGO_EMAIL || 'ergo@example.com',
    password: process.env.DEFAULT_ERGO_PASSWORD || 'password',
    age: 35,
    profilePicture: '',
  },
];

const initialPatients: Patient[] = [];

const initialSessions: Record<string, SessionStats[]> = {};

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

  async getSessionById(
    sessionId: string,
  ): Promise<{ patientId: string; session: SessionStats } | undefined> {
    const sessionsByPatient = await this.getSessionsByPatient();

    for (const [patientId, sessions] of Object.entries(sessionsByPatient)) {
      const session = sessions.find((item) => item.id === sessionId);
      if (session) {
        return { patientId, session };
      }
    }

    return undefined;
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
