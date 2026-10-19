import { Router } from 'express';

import { getDictionaries } from '../controllers/dictionary.controller';
import { JsonStorageService } from '../services/json-storage.service';

export function createDictionaryRouter(storage: JsonStorageService): Router {
  const router = Router();

  router.get('/', (request, response, next) => {
    getDictionaries(storage, request, response).catch(next);
  });

  return router;
}
