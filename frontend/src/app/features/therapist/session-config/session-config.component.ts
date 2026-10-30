import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GameConfig } from '../../../core/models/game-config.model';
import { PATIENT_AVATARS, Patient } from '../../../core/models/patient.model';
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
  readonly avatars = PATIENT_AVATARS;

  patient: Patient | undefined;
  isUpdatingAvatar = false;
  avatarMessage = '';
  isAddingWord = false;
  removingWord: string | null = null;
  customWordError = '';
  customWordMessage = '';
  customWordWarning = '';

  readonly configForm = this.formBuilder.nonNullable.group({
    difficulty: this.formBuilder.nonNullable.control<GameConfig['difficulty']>('Normal', Validators.required),
    durationSeconds: this.formBuilder.nonNullable.control<GameConfig['durationSeconds']>(90, Validators.required),
    mode: this.formBuilder.nonNullable.control<GameConfig['mode']>('Mot exact', Validators.required),
    theme: this.formBuilder.nonNullable.control<GameConfig['theme']>('Football', Validators.required),
    reducedEffects: this.formBuilder.nonNullable.control<boolean>(false),
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
        this.configForm.patchValue({
          ...config,
          reducedEffects: config.reducedEffects ?? false,
        });
      },
      error: () => {
        void this.router.navigate(['/dashboard']);
      },
    });
  }

  getWordLevelLabel(word: string): GameConfig['difficulty'] {
    if (word.length <= 4) {
      return 'Facile';
    }
    return word.length <= 8 ? 'Normal' : 'Difficile';
  }

  addCustomWord(): void {
    if (!this.patient || this.isAddingWord) {
      return;
    }

    const rawInput = this.configForm.controls.customWord.value.trim().toLowerCase();
    this.customWordError = '';
    this.customWordMessage = '';
    this.customWordWarning = '';

    if (!rawInput) {
      this.customWordError = 'Veuillez saisir un mot à ajouter.';
      return;
    }

    if (!/^[a-zàâäéèêëîïôöùûüç]+$/i.test(rawInput)) {
      this.customWordError = 'Le mot ne doit contenir que des lettres (sans espaces ni chiffres).';
      return;
    }

    if (this.patient.customWords?.some((existing) => existing.toLowerCase() === rawInput)) {
      this.customWordError = 'Ce mot figure déjà dans le dictionnaire de ce patient.';
      return;
    }

    this.isAddingWord = true;
    this.patientService.addCustomWords(this.patient.id, [rawInput]).subscribe({
      next: (result) => {
        this.patient = { ...this.patient!, customWords: result.customWords };
        this.configForm.controls.customWord.setValue('');
        this.customWordMessage = `Mot « ${rawInput} » ajouté (${this.getWordLevelLabel(rawInput)}).`;
        this.customWordWarning = result.warning ?? '';
        this.isAddingWord = false;
      },
      error: () => {
        this.customWordError = "Impossible d'ajouter ce mot pour le moment.";
        this.isAddingWord = false;
      },
    });
  }

  removeCustomWord(word: string): void {
    if (!this.patient || this.removingWord) {
      return;
    }

    this.removingWord = word;
    this.customWordError = '';
    this.customWordMessage = '';
    this.customWordWarning = '';

    this.patientService.removeCustomWord(this.patient.id, word).subscribe({
      next: (result) => {
        this.patient = { ...this.patient!, customWords: result.customWords };
        this.removingWord = null;
      },
      error: () => {
        this.customWordError = 'Impossible de supprimer ce mot.';
        this.removingWord = null;
      },
    });
  }

  selectAvatar(avatarPath: string): void {
    if (!this.patient || this.isUpdatingAvatar || this.patient.avatar === avatarPath) {
      return;
    }

    this.isUpdatingAvatar = true;
    this.avatarMessage = '';

    this.patientService.updatePatientAvatar(this.patient.id, avatarPath).subscribe({
      next: (updatedPatient) => {
        this.patient = updatedPatient;
        this.isUpdatingAvatar = false;
        this.avatarMessage = 'Photo de profil mise à jour !';
      },
      error: () => {
        this.isUpdatingAvatar = false;
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

  toggleReducedEffects(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.configForm.controls.reducedEffects.setValue(isChecked);
  }

  goBack(): void {
    void this.router.navigate(['/patient', this.patient?.id ?? '']);
  }
}