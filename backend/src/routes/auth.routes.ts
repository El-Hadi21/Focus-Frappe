import { Router } from 'express';

import { login, register } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { loginSchema, registerSchema } from '../validators/schemas';
import { JsonStorageService } from '../services/json-storage.service';

export function createAuthRouter(storage: JsonStorageService): Router {
  const router = Router();

  router.post('/login', validateBody(loginSchema), (request, response, next) => {
    login(storage, request, response).catch(next);
  });
  router.post('/register', validateBody(registerSchema), (request, response, next) => {
    register(storage, request, response).catch(next);
  });

  return router;
}
