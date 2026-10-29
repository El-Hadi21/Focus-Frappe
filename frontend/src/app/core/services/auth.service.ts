import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';

export interface Practitioner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/api/auth';
  private readonly practitionerSubject = new BehaviorSubject<Practitioner | null>(
    this.getStoredPractitioner(),
  );
  readonly practitioner$ = this.practitionerSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string): Observable<boolean> {
    return this.http
      .post<{ authenticated: boolean; practitioner?: Practitioner }>(`${this.apiUrl}/login`, {
        email,
        password,
      })
      .pipe(
        tap((result) => {
          if (result.authenticated && result.practitioner) {
            this.setPractitioner(result.practitioner);
          }
        }),
        map((result) => result.authenticated),
      );
  }

  register(data: RegisterData): Observable<boolean> {
    return this.http
      .post<unknown>(`${this.apiUrl}/register`, data)
      .pipe(map(() => true));
  }

  get currentPractitioner(): Practitioner | null {
    return this.practitionerSubject.value;
  }

  logout(): void {
    localStorage.removeItem('focus-frappe-practitioner');
    this.practitionerSubject.next(null);
  }

  private setPractitioner(practitioner: Practitioner): void {
    localStorage.setItem('focus-frappe-practitioner', JSON.stringify(practitioner));
    this.practitionerSubject.next(practitioner);
  }

  private getStoredPractitioner(): Practitioner | null {
    const storedPractitioner = localStorage.getItem('focus-frappe-practitioner');

    if (!storedPractitioner) {
      return null;
    }

    try {
      return JSON.parse(storedPractitioner) as Practitioner;
    } catch {
      localStorage.removeItem('focus-frappe-practitioner');
      return null;
    }
  }
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  password: string;
  confirmPassword: string;
  profilePicture?: string;
}
