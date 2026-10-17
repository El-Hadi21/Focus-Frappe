import { Patient } from './patient.model';
import { SessionStats } from './session-stats.model';

export interface Practitioner {
  id: string;
  email: string;
  password: string;
  name: string;
}

export interface DatabaseSchema {
  practitioners: Practitioner[];
  patients: Patient[];
  sessionsByPatient: Record<string, SessionStats[]>;
}
