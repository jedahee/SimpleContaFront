import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormatterService {

  constructor() { }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    })
      .format(value)
      .replace('€', '') // Quitar el símbolo € si no lo necesitas
      .trim();
  }

  formatPercentage(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + ' %';
  }
}
