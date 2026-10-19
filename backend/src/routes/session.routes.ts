import { Router } from 'express';

import { getSession } from '../controllers/session.controller';
import { JsonStorageService } from '../services/json-storage.service';

export function createSessionRouter(storage: JsonStorageService): Router {
  const router = Router();

  router.get('/:sessionId', (request, response, next) => {
    getSession(storage, request, response).catch(next);
  });

  return router;
}
