import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Patient } from '../../../core/models/patient.model';
import { AuthService } from '../../../core/services/auth.service';
import { PatientService } from '../../../core/services/patient.service';
import { SessionService } from '../../../core/services/session.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LoaderComponent, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly patientService = inject(PatientService);
  private readonly sessionService = inject(SessionService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  patients: Patient[] = [];
  isLoading = true;

  persona = {
    lastName: 'Martin',
    firstName: 'Claire',
    avatarUrl: '/assets/UI/ergo-persona.png',
    initials: 'CM',
  };

  avatarLoadError = false;
  lastConnectedAt: Date = new Date();
  lastPlayedPatientName = 'Aucune séance jouée';

  ngOnInit(): void {
    const practitioner = this.authService.currentPractitioner;
    if (practitioner) {
      this.persona = {
        lastName: practitioner.lastName || 'Martin',
        firstName: practitioner.firstName || 'Claire',
        avatarUrl: practitioner.profilePicture || '/assets/UI/ergo-persona.png',
        initials:
          `${practitioner.firstName?.[0] ?? 'C'}${practitioner.lastName?.[0] ?? 'M'}`.toUpperCase(),
      };
    }

    const storedLoginTime = localStorage.getItem('ff_last_connected_at');
    if (storedLoginTime) {
      this.lastConnectedAt = new Date(storedLoginTime);
    } else {
      const now = new Date();
      localStorage.setItem('ff_last_connected_at', now.toISOString());
      this.lastConnectedAt = now;
    }

    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.isLoading = false;
        this.resolveLastPlayedPatient(patients);
      },
      error: () => {
        this.patients = [];
        this.isLoading = false;
      },
    });
  }

  private resolveLastPlayedPatient(patients: Patient[]): void {
    if (patients.length === 0) {
      this.lastPlayedPatientName = 'Aucun patient';
      return;
    }

    let latestDate = 0;
    let latestPatient: Patient | null = null;

    // 1. Vérification immédiate du dernier patient enregistré en session locale/active
    const recentRecord = this.sessionService.getLastPlayedPatientRecord();
    if (recentRecord) {
      const matched = patients.find((p) => p.id === recentRecord.patientId);
      if (matched) {
        latestDate = recentRecord.timestamp;
        latestPatient = matched;
      }
    }

    // 2. Croisement avec l'historique complet des séances en base
    const statsRequests = patients.map((patient) =>
      this.sessionService.getPatientStats(patient.id).pipe(
        map((sessions) => ({ patient, sessions })),
        catchError(() => of({ patient, sessions: [] })),
      ),
    );

    forkJoin(statsRequests).subscribe((results) => {
      for (const { patient, sessions } of results) {
        for (const session of sessions) {
          const sessionTime = session.date.getTime();
          if (sessionTime > latestDate) {
            latestDate = sessionTime;
            latestPatient = patient;
          }
        }
      }

      this.lastPlayedPatientName = latestPatient
        ? `${latestPatient.firstName} ${latestPatient.lastName}`
        : 'Aucune séance jouée';
    });
  }

  goToPatient(id: string): void {
    void this.router.navigate(['/patient', id]);
  }

  goToCreateProfile(): void {
    void this.router.navigate(['/create-profile']);
  }

  logout(): void {
    localStorage.setItem('ff_last_connected_at', new Date().toISOString());
    this.authService.logout?.();
    void this.router.navigate(['/login']);
  }
}