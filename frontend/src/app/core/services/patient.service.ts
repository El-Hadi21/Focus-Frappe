import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { Patient } from '../models/patient.model';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private readonly patientsSubject = new BehaviorSubject<Patient[]>([
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
  ]);

  getPatients(): Observable<Patient[]> {
    return this.patientsSubject.asObservable();
  }

  getPatientById(id: string): Patient | undefined {
    return this.patientsSubject.value.find((patient) => patient.id === id);
  }

  addPatient(patient: Omit<Patient, 'id'>): Observable<boolean> {
    const newPatient: Patient = {
      ...patient,
      id: `patient-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };

    this.patientsSubject.next([...this.patientsSubject.value, newPatient]);

    return of(true).pipe(delay(500));
  }
  deletePatient(id: string): Observable<boolean> {
       const currentPatients = this.patientsSubject.value;
       const updatedPatients = currentPatients.filter((p) => p.id !== id);
       this.patientsSubject.next(updatedPatients);

       // Simulation du délai réseau
       return of(true).pipe(delay(500));
     }
}
