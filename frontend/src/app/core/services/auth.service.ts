import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  login(_email: string, _password: string): Observable<boolean> {
    return of(true).pipe(delay(1000));
  }

  register(_data: RegisterData): Observable<boolean> {
    return of(true).pipe(delay(500));
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
