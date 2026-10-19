import { Patient } from './patient.model';
import { SessionStats } from './session-stats.model';

export interface Practitioner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  age: number;
  profilePicture?: string;
}

export interface DatabaseSchema {
  practitioners: Practitioner[];
  patients: Patient[];
  sessionsByPatient: Record<string, SessionStats[]>;
}
