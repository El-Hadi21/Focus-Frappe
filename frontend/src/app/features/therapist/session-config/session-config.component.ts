import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { GameConfig } from '../../../core/models/game-config.model';
import { Patient } from '../../../core/models/patient.model';
import { GameConfigService } from '../../../core/services/game-config.service';
import { PatientService } from '../../../core/services/patient.service';
import { ClinicalDefaultsService } from '../../game/services/clinical-defaults.service';

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
  private readonly gameConfigService = inject(GameConfigService);
  private readonly clinicalDefaultsService = inject(ClinicalDefaultsService);
  private readonly formBuilder = inject(FormBuilder);

  readonly difficulties: GameConfig['difficulty'][] = ['Facile', 'Normal', 'Difficile'];
  readonly durations: GameConfig['durationSeconds'][] = [30, 60, 90, 120, 150, 180];
  readonly themes: GameConfig['theme'][] = ['Football', 'Espace'];
  patient: Patient | undefined;
  isAddingWord = false;
  customWordError = '';
  customWordMessage = '';

  readonly configForm = this.formBuilder.nonNullable.group({
    difficulty: this.formBuilder.nonNullable.control<GameConfig['difficulty']>('Normal', Validators.required),
    durationSeconds: this.formBuilder.nonNullable.control<GameConfig['durationSeconds']>(90, Validators.required),
    mode: this.formBuilder.nonNullable.control<GameConfig['mode']>('Mot exact', Validators.required),
    theme: this.formBuilder.nonNullable.control<GameConfig['theme']>('Football', Validators.required),
    customWord: this.formBuilder.nonNullable.control(''),
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
        const config = this.gameConfigService.getConfigForPatient(patient.id)
          ?? this.clinicalDefaultsService.getDefaultConfig(patient);
        this.configForm.patchValue(config);
      },
      error: () => {
        void this.router.navigate(['/dashboard']);
      },
    });
  }

  addCustomWord(): void {
    if (!this.patient || this.isAddingWord) {
      return;
    }

    const word = this.configForm.controls.customWord.value.trim().toLowerCase();
    const difficulty = this.configForm.controls.difficulty.value;
    const minLength = difficulty === 'Facile' ? 1 : difficulty === 'Normal' ? 5 : 9;
    const maxLength = difficulty === 'Facile' ? 4 : difficulty === 'Normal' ? 8 : Infinity;

    this.customWordError = '';
    this.customWordMessage = '';

    if (!word) {
      this.customWordError = 'Saisissez un mot à ajouter.';
      return;
    }

    if (word.length < minLength || word.length > maxLength) {
      this.customWordError = `Pour le niveau ${difficulty}, le mot doit contenir ${maxLength === Infinity ? `${minLength} lettres minimum` : `entre ${minLength} et ${maxLength} lettres`}.`;
      return;
    }

    this.isAddingWord = true;
    this.patientService.addCustomWords(this.patient.id, [word]).subscribe({
      next: (result) => {
        this.patient = { ...this.patient!, customWords: result.customWords };
        this.configForm.controls.customWord.setValue('');
        this.customWordMessage = result.warning ?? 'Mot ajouté avec succès.';
        this.isAddingWord = false;
      },
      error: () => {
        this.customWordError = 'Impossible d’ajouter ce mot pour le moment.';
        this.isAddingWord = false;
      },
    });
  }

  onSubmit(): void {
    if (this.configForm.invalid || !this.patient) {
      this.configForm.markAllAsTouched();
      return;
    }

    const { customWord: _customWord, ...config } = this.configForm.getRawValue();
    this.gameConfigService.setConfigForPatient(this.patient.id, config);
    void this.router.navigate(['/game', this.patient.id]);
  }

  toggleMode(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.configForm.controls.mode.setValue(isChecked ? 'Mot à trous' : 'Mot exact');
  }

  goBack(): void {
    void this.router.navigate(['/patient', this.patient?.id ?? '']);
  }

}
