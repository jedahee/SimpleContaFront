import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authTokenKey = 'authToken'; // Nombre de la clave en localStorage
  private authTokenSubject = new BehaviorSubject<string | null>(this.getToken());
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Login: envía las credenciales al backend
  login(password: string): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/api/authentication', { password }).pipe(
      tap(response => {
        if (response && response.token) {
          this.setToken(response.token);
        }
      })
    );
  }

  // Guardar el token en localStorage
  private setToken(token: string): void {
    localStorage.setItem(this.authTokenKey, token);
    this.authTokenSubject.next(token);
  }

  // Obtener el token desde localStorage
  getToken(): string | null {
    return localStorage.getItem(this.authTokenKey);
  }

  // Eliminar el token al cerrar sesión
  logout(): void {
    localStorage.removeItem(this.authTokenKey);
    this.authTokenSubject.next(null);
  }

  // Observable para seguir el estado del token
  getToken$(): Observable<string | null> {
    return this.authTokenSubject.asObservable();
  }
}
