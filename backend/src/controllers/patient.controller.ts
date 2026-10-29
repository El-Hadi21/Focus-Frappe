import { Request, Response } from 'express';

import { Patient } from '../models/patient.model';
import { SessionStats } from '../models/session-stats.model';
import { JsonStorageService } from '../services/json-storage.service';
import { calculateGameScore, calculateVariability } from '../utils/clinical-stats.utils';

export async function listPatients(
  storage: JsonStorageService,
  _request: Request,
  response: Response,
): Promise<void> {
  response.status(200).json(await storage.getPatients());
}

export async function getPatient(
  storage: JsonStorageService,
  request: Request,
  response: Response,
): Promise<void> {
  const patients = await storage.getPatients();
  const patient = patients.find((item) => item.id === request.params.id);

  if (!patient) {
    response.status(404).json({ message: 'Patient introuvable' });
    return;
  }

  response.status(200).json(patient);
}

export async function listPatientSessions(
  storage: JsonStorageService,
  request: Request,
  response: Response,
): Promise<void> {
  if (!(await storage.getPatientById(request.params.id))) {
    response.status(404).json({ message: 'Patient introuvable' });
    return;
  }

  const sessionsByPatient = await storage.getSessionsByPatient();
  const sessions = [...(sessionsByPatient[request.params.id] ?? [])].sort(
    (first, second) => Date.parse(second.date) - Date.parse(first.date),
  );

  response.status(200).json(sessions);
}

export async function createPatient(
  storage: JsonStorageService,
  request: Request,
  response: Response,
): Promise<void> {
  const patients = await storage.getPatients();
  const sessionsByPatient = await storage.getSessionsByPatient();
  const patient: Patient = {
    ...(request.body as Omit<Patient, 'id'>),
    id: createPatientId(patients),
  };

  patients.push(patient);
  sessionsByPatient[patient.id] = [];
  await Promise.all([
    storage.savePatients(patients),
    storage.saveSessionsByPatient(sessionsByPatient),
  ]);

  response.status(201).json(patient);
}

export async function updatePatientAvatar(
  storage: JsonStorageService,
  request: Request,
  response: Response,
): Promise<void> {
  const patient = await storage.getPatientById(request.params.id);
  if (!patient) {
    response.status(404).json({ message: 'Patient introuvable' });
    return;
  }

  const { avatar } = request.body as { avatar: string };
  const updatedPatient: Patient = {
    ...patient,
    avatar,
  };

  await storage.savePatient(updatedPatient);
  response.status(200).json(updatedPatient);
}

export async function addCustomWords(
  storage: JsonStorageService,
  request: Request,
  response: Response,
): Promise<void> {
  const patient = await storage.getPatientById(request.params.id);

  if (!patient) {
    response.status(404).json({ message: 'Patient introuvable' });
    return;
  }

  const customWords = Array.isArray(patient.customWords) ? patient.customWords : [];
  const newWords = request.body.words as string[];
  const existingWords = new Set(customWords);
  const wordsToAdd = newWords.filter((word) => {
    if (existingWords.has(word)) {
      return false;
    }

    existingWords.add(word);
    return true;
  });
  const updatedPatient: Patient = {
    ...patient,
    customWords: [...customWords, ...wordsToAdd],
  };

  await storage.savePatient(updatedPatient);

  const hasAccentedWord = wordsToAdd.some((word) => /[àâäçéèêëîïôöùûüÿñæœ]/i.test(word));
  response.status(201).json({
    message: 'Mots ajoutés avec succès',
    customWords: updatedPatient.customWords,
    warning: hasAccentedWord
      ? 'Attention: certains mots contiennent des accents, ce qui peut impacter la vitesse de frappe.'
      : null,
  });
}
export async function removeCustomWord(
  storage: JsonStorageService,
  request: Request,
  response: Response,
): Promise<void> {
  const patient = await storage.getPatientById(request.params.id);
  if (!patient) {
    response.status(404).json({ message: 'Patient introuvable' });
    return;
  }

  const wordToRemove = decodeURIComponent(request.params.word).trim().toLowerCase();
  const customWords = Array.isArray(patient.customWords) ? patient.customWords : [];

  const updatedPatient: Patient = {
    ...patient,
    customWords: customWords.filter((word) => word.toLowerCase() !== wordToRemove),
  };

  await storage.savePatient(updatedPatient);

  response.status(200).json({
    message: 'Mot supprimé avec succès',
    customWords: updatedPatient.customWords,
  });
}

export async function saveSession(
  storage: JsonStorageService,
  request: Request,
  response: Response,
): Promise<void> {
  const patientId = request.params.id;
  const {
    patientId: bodyPatientId,
    sessionId,
    config,
    responseTimesMs,
    obstaclesCleared,
    obstaclesMissed,
    outOfWindowClicks,
    typingErrors,
    currentMaxStreak,
    playedDurationSec,
    abandoned,
  } = request.body as SaveSessionRequest;

  if (bodyPatientId !== patientId) {
    response.status(400).json({ message: 'Le patientId ne correspond pas au patient demandé' });
    return;
  }

  if (!(await storage.getPatientById(patientId))) {
    response.status(404).json({ message: 'Patient introuvable' });
    return;
  }

  const sessionsByPatient = await storage.getSessionsByPatient();
  const patientSessions = sessionsByPatient[patientId] ?? [];
  const variability = calculateVariability(responseTimesMs, obstaclesCleared);
  const gameScore = calculateGameScore(obstaclesCleared, obstaclesMissed, abandoned);
  const existingSession = sessionId
    ? patientSessions.find((session) => session.id === sessionId)
    : undefined;

  if (existingSession) {
    const aggregatedResponseTimesMs = existingSession.responseTimesMs
      ? [...existingSession.responseTimesMs, ...responseTimesMs]
      : undefined;
    const aggregatedObstaclesCleared = existingSession.obstaclesCleared + obstaclesCleared;
    const aggregatedVariability = aggregatedResponseTimesMs
      ? calculateVariability(aggregatedResponseTimesMs, aggregatedObstaclesCleared)
      : {
          avgSec: calculateWeightedAverage(
            existingSession.avgResponseTimeSec,
            existingSession.gamesCount,
            variability.avgSec,
          ),
        };

    existingSession.gamesCount += 1;
    existingSession.obstaclesCleared = aggregatedObstaclesCleared;
    existingSession.obstaclesMissed += obstaclesMissed;
    existingSession.outOfWindowClicks += outOfWindowClicks;
    existingSession.typingErrors += typingErrors;
    existingSession.playedDurationSec += playedDurationSec;
    existingSession.plannedDurationSec += config.durationSeconds;
    existingSession.score += gameScore.score;
    existingSession.maxStreak = Math.max(existingSession.maxStreak, currentMaxStreak);
    existingSession.abandons += abandoned ? 1 : 0;
    existingSession.avgResponseTimeSec = aggregatedVariability.avgSec;
    existingSession.variabilityMinSec = aggregatedVariability.minSec;
    existingSession.variabilityMaxSec = aggregatedVariability.maxSec;
    if (aggregatedResponseTimesMs) {
      existingSession.responseTimesMs = aggregatedResponseTimesMs;
    }

    await storage.saveSessionsByPatient(sessionsByPatient);
    response.status(200).json({ sessionId: existingSession.id, session: existingSession });
    return;
  }

  const newSession: SessionStats = {
    id: createSessionId(patientId),
    date: new Date().toISOString(),
    gamesCount: 1,
    config,
    responseTimesMs: [...responseTimesMs],
    avgResponseTimeSec: variability.avgSec,
    ...(variability.minSec === undefined ? {} : { variabilityMinSec: variability.minSec }),
    ...(variability.maxSec === undefined ? {} : { variabilityMaxSec: variability.maxSec }),
    obstaclesCleared,
    obstaclesMissed,
    outOfWindowClicks,
    typingErrors,
    maxStreak: currentMaxStreak,
    playedDurationSec,
    plannedDurationSec: config.durationSeconds,
    abandons: abandoned ? 1 : 0,
    score: gameScore.score,
  };

  patientSessions.push(newSession);
  sessionsByPatient[patientId] = patientSessions;
  await storage.saveSessionsByPatient(sessionsByPatient);

  response.status(201).json({ sessionId: newSession.id, session: newSession });
}

export async function saveSessionNotes(
  storage: JsonStorageService,
  request: Request,
  response: Response,
): Promise<void> {
  const patientId = request.params.id;
  const patient = await storage.getPatientById(patientId);

  if (!patient) {
    response.status(404).json({ message: 'Patient introuvable' });
    return;
  }

  const sessionsByPatient = await storage.getSessionsByPatient();
  const sessions = sessionsByPatient[patientId] ?? [];
  const session = sessions.find((item) => item.id === request.params.sessionId);

  if (!session) {
    response.status(404).json({ message: 'Séance introuvable' });
    return;
  }

  const { notes } = request.body as { notes: string };
  session.notes = notes;
  sessionsByPatient[patientId] = sessions;
  await storage.saveSessionsByPatient(sessionsByPatient);

  response.status(200).json({
    message: 'Notes enregistrées avec succès',
    notes,
  });
}

export async function deletePatient(
  storage: JsonStorageService,
  request: Request,
  response: Response,
): Promise<void> {
  const patients = await storage.getPatients();
  const sessionsByPatient = await storage.getSessionsByPatient();
  const patientIndex = patients.findIndex((item) => item.id === request.params.id);

  if (patientIndex === -1) {
    response.status(404).json({ message: 'Patient introuvable' });
    return;
  }

  patients.splice(patientIndex, 1);
  delete sessionsByPatient[request.params.id];
  await Promise.all([
    storage.savePatients(patients),
    storage.saveSessionsByPatient(sessionsByPatient),
  ]);

  response.status(200).json({ deleted: true });
}

function createPatientId(patients: Patient[]): string {
  let id: string;
  do {
    id = `patient-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  } while (patients.some((patient) => patient.id === id));

  return id;
}

interface SaveSessionRequest {
  patientId: string;
  sessionId?: string;
  config: SessionStats['config'];
  responseTimesMs: number[];
  obstaclesCleared: number;
  obstaclesMissed: number;
  outOfWindowClicks: number;
  typingErrors: number;
  currentMaxStreak: number;
  playedDurationSec: number;
  abandoned: boolean;
}

function calculateWeightedAverage(
  existingAverage: number,
  existingGamesCount: number,
  newAverage: number,
): number {
  return (existingAverage * existingGamesCount + newAverage) / (existingGamesCount + 1);
}

function createSessionId(patientId: string): string {
  return `session-${patientId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
