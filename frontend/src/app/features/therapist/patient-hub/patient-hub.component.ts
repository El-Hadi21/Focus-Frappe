import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Patient } from '../../../core/models/patient.model';
import { PatientService } from '../../../core/services/patient.service';

@Component({
  selector: 'app-patient-hub',
  standalone: true,
  imports: [],
  templateUrl: './patient-hub.component.html',
  styleUrl: './patient-hub.component.scss',
})
export class PatientHubComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly patientService = inject(PatientService);
  private readonly router = inject(Router);
  isDeleting = false;
  showDeleteModal = false;
  patient: Patient | undefined;

  ngOnInit(): void {
    const patientId = this.route.snapshot.paramMap.get('id');
    if (!patientId) {
      void this.router.navigate(['/dashboard']);
      return;
    }

    this.patientService.getPatientById(patientId).subscribe({
      next: (patient) => {
        this.patient = patient;
      },
      error: () => {
        void this.router.navigate(['/dashboard']);
      },
    });
  }

  goToGame(): void {
    if (this.patient) {
      void this.router.navigate(['/game', this.patient.id]);
    }
  }

  goToConfig(): void {
    if (this.patient) {
      void this.router.navigate(['/configuration', this.patient.id]);
    }
  }

  goToStats(): void {
    if (this.patient) {
      void this.router.navigate(['/stats', this.patient.id]);
    }
  }

  goToDashboard(): void {
    void this.router.navigate(['/dashboard']);
  }
  deleteProfile(): void {
    if (this.patient && !this.isDeleting) {
      this.showDeleteModal = true;
    }
  }

  cancelDelete(): void {
    if (!this.isDeleting) {
      this.showDeleteModal = false;
    }
  }

  confirmDelete(): void {
    if (!this.patient || this.isDeleting) {
      return;
    }

    this.isDeleting = true;
    this.showDeleteModal = false;

    this.patientService.deletePatient(this.patient.id).subscribe({
      next: () => {
        void this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isDeleting = false;
      },
    });
  }
}
