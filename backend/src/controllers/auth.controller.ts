import { Request, Response } from 'express';

import { Practitioner } from '../models/database.model';
import { JsonStorageService } from '../services/json-storage.service';

export async function login(
  storage: JsonStorageService,
  request: Request,
  response: Response,
): Promise<void> {
  const { email, password } = request.body as { email: string; password: string };
  const normalizedEmail = email.toLowerCase();
  const practitioners = await storage.getPractitioners();
  const practitioner = practitioners.find(
    (item) => item.email.toLowerCase() === normalizedEmail && item.password === password,
  );

  if (practitioner) {
    response.status(200).json({
      authenticated: true,
      practitioner: {
        id: practitioner.id,
        firstName: practitioner.firstName,
        lastName: practitioner.lastName,
        name: `${practitioner.firstName} ${practitioner.lastName}`,
        email: practitioner.email,
        ...(practitioner.profilePicture === undefined
          ? {}
          : { profilePicture: practitioner.profilePicture }),
      },
    });
    return;
  }

  response.status(401).json({
    authenticated: false,
    message: 'Identifiants invalides',
  });
}

export async function register(
  storage: JsonStorageService,
  request: Request,
  response: Response,
): Promise<void> {
  const {
    firstName,
    lastName,
    email,
    password,
    age,
    profilePicture,
  } = request.body as Omit<Practitioner, 'id'> & { confirmPassword: string };
  const practitioners = await storage.getPractitioners();
  const normalizedEmail = email.toLowerCase();

  if (practitioners.some((practitioner) => practitioner.email.toLowerCase() === normalizedEmail)) {
    response.status(409).json({
      message: 'Cette adresse email est déjà utilisée',
    });
    return;
  }

  const practitioner: Practitioner = {
    id: createPractitionerId(practitioners),
    firstName,
    lastName,
    email: normalizedEmail,
    password,
    age,
    ...(profilePicture === undefined ? {} : { profilePicture }),
  };

  await storage.savePractitioners([...practitioners, practitioner]);

  response.status(201).json({
    id: practitioner.id,
    firstName: practitioner.firstName,
    lastName: practitioner.lastName,
    email: practitioner.email,
    age: practitioner.age,
    ...(practitioner.profilePicture === undefined
      ? {}
      : { profilePicture: practitioner.profilePicture }),
  });
}

function createPractitionerId(practitioners: Practitioner[]): string {
  let id: string;
  do {
    id = `practitioner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  } while (practitioners.some((practitioner) => practitioner.id === id));

  return id;
}
