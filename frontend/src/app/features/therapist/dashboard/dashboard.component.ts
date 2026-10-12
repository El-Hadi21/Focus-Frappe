import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Patient } from '../../../core/models/patient.model';
import { PatientService } from '../../../core/services/patient.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly patientService = inject(PatientService);
  private readonly router = inject(Router);

  patients: Patient[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.isLoading = false;
      },
      error: () => {
        this.patients = [];
        this.isLoading = false;
      },
    });
  }

  goToPatient(id: string): void {
    void this.router.navigate(['/game', id]);
  }

  logout(): void {
    void this.router.navigate(['/login']);
  }
}
