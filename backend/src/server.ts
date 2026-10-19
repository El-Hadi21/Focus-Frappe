import * as dotenv from 'dotenv';

dotenv.config();

import { createApp } from './app';
import { JsonStorageService } from './services/json-storage.service';

const port = Number(process.env.PORT ?? 3000);
const storage = new JsonStorageService();

async function startServer(): Promise<void> {
  await storage.initialize();

  const app = createApp(storage);
  app.listen(port, () => {
    console.log(`Focus & Frappe backend listening on http://localhost:${port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error('Unable to start the server:', error);
  process.exitCode = 1;
});
