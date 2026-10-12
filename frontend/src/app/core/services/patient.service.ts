import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { Patient } from '../models/patient.model';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  getPatients(): Observable<Patient[]> {
    const patients: Patient[] = [
      {
        id: 'patient-leo',
        firstName: 'Léo',
        lastName: 'Martin',
        age: 8,
        dysgraphiaSeverity: 'Légère',
        attentionProfile: 'Inattentif',
      },
      {
        id: 'patient-ines',
        firstName: 'Inès',
        lastName: 'Bernard',
        age: 10,
        dysgraphiaSeverity: 'Modérée',
        attentionProfile: 'Mixte',
      },
      {
        id: 'patient-noah',
        firstName: 'Noah',
        lastName: 'Petit',
        age: 9,
        dysgraphiaSeverity: 'Sévère',
        attentionProfile: 'Hyperactif',
      },
    ];

    return of(patients).pipe(delay(800));
  }
}
