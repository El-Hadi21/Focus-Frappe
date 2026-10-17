import cors from 'cors';
import express, { Express } from 'express';
import morgan from 'morgan';

import { JsonStorageService } from './services/json-storage.service';

export function createApp(storage: JsonStorageService): Express {
  const app = express();

  app.use(cors({ origin: 'http://localhost:4200' }));
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/api/health', (_request, response) => {
    const database = storage.getDatabase();
    response.json({
      status: 'ok',
      patientsCount: database.patients.length,
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}
