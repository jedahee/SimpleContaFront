import { Injectable } from '@angular/core';
import { HttpStatusErrors } from '../enums/http-status-errors';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorMessageSubject = new BehaviorSubject<string | null>(null);
  errorMessage$ = this.errorMessageSubject.asObservable();

  constructor() { }

  // Set the error message
  setErrorMessage(message: string) {
    this.errorMessageSubject.next(message);
  }

  // Clear the error message
  clearErrorMessage() {
    this.errorMessageSubject.next(null);
  }

  getErrorMessage(statusCode: number, error_msg: string): string {
    switch (statusCode) {
      case HttpStatusErrors.Unauthorized:
      case HttpStatusErrors.BadRequest:
        return 'La solicitud es incorrecta. Por favor, vuelve a iniciar sesión.';
      case HttpStatusErrors.Forbidden:
        return 'No tienes permisos para acceder a este recurso.';
      case HttpStatusErrors.NotFound:
        return 'El recurso solicitado no se encontró.';
      case HttpStatusErrors.Other:
      case HttpStatusErrors.InternalServerError:
        return 'Ocurrió un error interno en el servidor. Por favor, inténtalo más tarde.';
      default:
        return 'Ha ocurrido un error desconocido. Mensaje del error: ' + error_msg;
    }
  }
}
