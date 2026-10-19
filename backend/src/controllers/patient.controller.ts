import { Request, Response } from 'express';

import { Patient } from '../models/patient.model';
import { JsonStorageService } from '../services/json-storage.service';

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
