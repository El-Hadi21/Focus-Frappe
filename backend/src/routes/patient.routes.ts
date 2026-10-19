import { Router } from 'express';

import {
  addCustomWords,
  createPatient,
  deletePatient,
  getPatient,
  listPatients,
} from '../controllers/patient.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { JsonStorageService } from '../services/json-storage.service';
import { createPatientSchema } from '../validators/schemas';
import { customWordsSchema } from '../validators/schemas';

export function createPatientRouter(storage: JsonStorageService): Router {
  const router = Router();

  router.get('/', (request, response, next) => {
    listPatients(storage, request, response).catch(next);
  });
  router.get('/:id', (request, response, next) => {
    getPatient(storage, request, response).catch(next);
  });
  router.post('/', validateBody(createPatientSchema), (request, response, next) => {
    createPatient(storage, request, response).catch(next);
  });
  router.post('/:id/custom-words', validateBody(customWordsSchema), (request, response, next) => {
    addCustomWords(storage, request, response).catch(next);
  });
  router.delete('/:id', (request, response, next) => {
    deletePatient(storage, request, response).catch(next);
  });

  return router;
}
