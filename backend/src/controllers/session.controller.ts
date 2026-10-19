import { Request, Response } from 'express';

import { JsonStorageService } from '../services/json-storage.service';

export async function getSession(
  storage: JsonStorageService,
  request: Request,
  response: Response,
): Promise<void> {
  const result = await storage.getSessionById(request.params.sessionId);

  if (!result) {
    response.status(404).json({ message: 'Séance introuvable' });
    return;
  }

  response.status(200).json(result);
}
