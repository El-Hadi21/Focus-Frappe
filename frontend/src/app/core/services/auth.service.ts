import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/api/auth';

  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string): Observable<boolean> {
    return this.http
      .post<{ authenticated: boolean; practitioner: unknown }>(`${this.apiUrl}/login`, {
        email,
        password,
      })
      .pipe(map((result) => result.authenticated));
  }

  register(data: RegisterData): Observable<boolean> {
    return this.http
      .post<unknown>(`${this.apiUrl}/register`, data)
      .pipe(map(() => true));
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
