import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { PatientService } from '../../../core/services/patient.service';

@Component({
  selector: 'app-create-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-profile.component.html',
  styleUrl: './create-profile.component.scss',
})
export class CreateProfileComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly patientService = inject(PatientService);
  private readonly router = inject(Router);

  readonly patientForm = this.formBuilder.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    age: [0, [Validators.required, Validators.min(1), Validators.max(120)]],
    dysgraphiaSeverity: ['legere', Validators.required],
    attentionProfile: ['inattentif', Validators.required],
  });

  isSaving = false;

  onSubmit(): void {
    if (this.patientForm.invalid || this.isSaving) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    this.patientService.addPatient(this.patientForm.getRawValue()).subscribe({
      next: () => {
        void this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isSaving = false;
      },
    });
  }

  cancel(): void {
    void this.router.navigate(['/dashboard']);
  }
}
