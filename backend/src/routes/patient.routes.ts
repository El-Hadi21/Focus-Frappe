import { Router } from 'express';

import {
  addCustomWords,
  createPatient,
  deletePatient,
  getPatient,
  listPatientSessions,
  listPatients,
  saveSession,
  saveSessionNotes,
} from '../controllers/patient.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { JsonStorageService } from '../services/json-storage.service';
import {
  createPatientSchema,
  customWordsSchema,
  saveSessionSchema,
  sessionNotesSchema,
} from '../validators/schemas';

export function createPatientRouter(storage: JsonStorageService): Router {
  const router = Router();

  router.get('/', (request, response, next) => {
    listPatients(storage, request, response).catch(next);
  });
  router.get('/:id', (request, response, next) => {
    getPatient(storage, request, response).catch(next);
  });
  router.get('/:id/sessions', (request, response, next) => {
    listPatientSessions(storage, request, response).catch(next);
  });
  router.post('/', validateBody(createPatientSchema), (request, response, next) => {
    createPatient(storage, request, response).catch(next);
  });
  router.post('/:id/custom-words', validateBody(customWordsSchema), (request, response, next) => {
    addCustomWords(storage, request, response).catch(next);
  });
  router.post('/:id/sessions', validateBody(saveSessionSchema), (request, response, next) => {
    saveSession(storage, request, response).catch(next);
  });
  router.patch(
    '/:id/sessions/:sessionId/notes',
    validateBody(sessionNotesSchema),
    (request, response, next) => {
      saveSessionNotes(storage, request, response).catch(next);
    },
  );
  router.delete('/:id', (request, response, next) => {
    deletePatient(storage, request, response).catch(next);
  });

  return router;
}
