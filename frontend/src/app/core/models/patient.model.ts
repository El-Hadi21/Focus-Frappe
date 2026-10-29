export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  dysgraphiaSeverity: string;
  attentionProfile: string;
  avatar?: string;
  customWords?: string[];
}

export interface PatientAvatarOption {
  id: string;
  label: string;
  category: 'Football' | 'Espace';
  path: string;
}

export const PATIENT_AVATARS: PatientAvatarOption[] = [
  { id: 'foot-av1', label: 'Football 1', category: 'Football', path: '/assets/profile-avatars/foot-av1.jpg' },
  { id: 'foot-av2', label: 'Football 2', category: 'Football', path: '/assets/profile-avatars/foot-av2.jpg' },
  { id: 'foot-av3', label: 'Football 3', category: 'Football', path: '/assets/profile-avatars/foot-av3.jpg' },
  { id: 'foot-av4', label: 'Football 4', category: 'Football', path: '/assets/profile-avatars/foot-av4.jpg' },
  { id: 'space-av1', label: 'Espace 1', category: 'Espace', path: '/assets/profile-avatars/space-av1.png' },
  { id: 'space-av2', label: 'Espace 2', category: 'Espace', path: '/assets/profile-avatars/sapce-av2.png' },
  { id: 'space-av3', label: 'Espace 3', category: 'Espace', path: '/assets/profile-avatars/space-av3.png' },
  { id: 'space-av4', label: 'Espace 4', category: 'Espace', path: '/assets/profile-avatars/space-av4.png' },
];
