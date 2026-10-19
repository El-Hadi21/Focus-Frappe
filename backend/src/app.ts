import cors from 'cors';
import express, { Express } from 'express';
import morgan from 'morgan';

import { createAuthRouter } from './routes/auth.routes';
import { createDictionaryRouter } from './routes/dictionary.routes';
import { createPatientRouter } from './routes/patient.routes';
import { createSessionRouter } from './routes/session.routes';
import { JsonStorageService } from './services/json-storage.service';

export function createApp(storage: JsonStorageService): Express {
  const app = express();

  app.use(cors({ origin: 'http://localhost:4200' }));
  app.use(express.json());
  app.use(morgan('dev'));
  app.use('/api/auth', createAuthRouter(storage));
  app.use('/api/dictionaries', createDictionaryRouter(storage));
  app.use('/api/patients', createPatientRouter(storage));
  app.use('/api/sessions', createSessionRouter(storage));

  app.get('/api/health', async (_request, response, next) => {
    try {
      const database = await storage.getDatabase();
      response.json({
        status: 'ok',
        patientsCount: database.patients.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error: unknown) {
      next(error);
    }
  });

  return app;
}
