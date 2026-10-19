import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { GameConfig } from '../../../core/models/game-config.model';
import { Patient } from '../../../core/models/patient.model';
import { PatientService } from '../../../core/services/patient.service';

@Component({
  selector: 'app-session-config',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './session-config.component.html',
  styleUrl: './session-config.component.scss',
})
export class SessionConfigComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly patientService = inject(PatientService);
  private readonly formBuilder = inject(FormBuilder);

  readonly difficulties: GameConfig['difficulty'][] = ['Facile', 'Normal', 'Difficile'];
  readonly durations: GameConfig['durationSeconds'][] = [30, 60, 90, 120, 150, 180];
  readonly themes: GameConfig['theme'][] = ['Football', 'Espace'];
  patient: Patient | undefined;

  readonly configForm = this.formBuilder.nonNullable.group({
    difficulty: this.formBuilder.nonNullable.control<GameConfig['difficulty']>('Normal', Validators.required),
    durationSeconds: this.formBuilder.nonNullable.control<GameConfig['durationSeconds']>(90, Validators.required),
    mode: this.formBuilder.nonNullable.control<GameConfig['mode']>('Mot exact', Validators.required),
    theme: this.formBuilder.nonNullable.control<GameConfig['theme']>('Football', Validators.required),
  });

  ngOnInit(): void {
    const patientId = this.route.snapshot.paramMap.get('id');
    if (!patientId) {
      void this.router.navigate(['/dashboard']);
      return;
    }

    this.patientService.getPatientById(patientId).subscribe({
      next: (patient) => {
        this.patient = patient;
        this.configForm.patchValue(this.getClinicalDefaults(patient));
      },
      error: () => {
        void this.router.navigate(['/dashboard']);
      },
    });
  }

  onSubmit(): void {
    if (this.configForm.invalid || !this.patient) {
      this.configForm.markAllAsTouched();
      return;
    }

    this.patientService.setCurrentConfig(this.configForm.getRawValue());
    void this.router.navigate(['/game', this.patient.id]);
  }

  toggleMode(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.configForm.controls.mode.setValue(isChecked ? 'Mot à trous' : 'Mot exact');
  }

  goBack(): void {
    void this.router.navigate(['/patient', this.patient?.id ?? '']);
  }

  private getClinicalDefaults(patient: Patient): Pick<GameConfig, 'difficulty' | 'durationSeconds'> {
    const dysgraphiaSeverity = this.normalize(patient.dysgraphiaSeverity);
    const attentionProfile = this.normalize(patient.attentionProfile);

    const difficulty: GameConfig['difficulty'] =
      dysgraphiaSeverity === 'severe'
        ? 'Facile'
        : dysgraphiaSeverity === 'moderee'
          ? 'Normal'
          : dysgraphiaSeverity === 'legere'
            ? 'Difficile'
            : 'Normal';

    const durationSeconds: GameConfig['durationSeconds'] =
      attentionProfile === 'inattentif'
        ? 60
        : attentionProfile === 'mixte'
          ? 90
          : attentionProfile === 'hyperactif'
            ? 120
            : 90;

    return { difficulty, durationSeconds };
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
