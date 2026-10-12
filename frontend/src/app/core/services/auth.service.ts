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
}
