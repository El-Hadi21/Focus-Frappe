import { Request, Response } from 'express';

import { JsonStorageService } from '../services/json-storage.service';

export async function getDictionaries(
  storage: JsonStorageService,
  _request: Request,
  response: Response,
): Promise<void> {
  response.status(200).json(await storage.getDictionaries());
}
