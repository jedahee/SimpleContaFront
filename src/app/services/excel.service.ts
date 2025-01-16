import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() {}


  public exportToExcel(data: any[], fileName: string): void {
    // Define nombres de las hojas
    const sheetNames = ['Villegas', 'Santa Aurelia'];

    // Crea un nuevo libro de Excel
    const workbook = XLSX.utils.book_new();

    // Recorre cada item del array y verifica su estructura
    data.forEach((item, index) => {
      // Verifica si el elemento es un array
      const worksheetData = Array.isArray(item)
        ? item
        .sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        ) // Ordena por fecha descendente
        .map((entry: any) => ({
          Fecha: new Date(entry.date).toLocaleDateString(),
          Ingresos: this.formatAsEuro(entry.dailyIncome),
          Gastos: this.formatAsEuro(entry.dailyExpense),
          Beneficios: this.formatAsEuro(entry.dailyProfit),
        }))
        : [];

      if (worksheetData.length > 0) {
        // Calcular totales
        const totalGastos = item.reduce((sum: number, entry: any) => sum + entry.dailyExpense, 0);
        const totalIngresos = item.reduce((sum: number, entry: any) => sum + entry.dailyIncome, 0);
        const totalBeneficios = item.reduce((sum: number, entry: any) => sum + entry.dailyProfit, 0);

        // Añadir la fila de totales
        worksheetData.push({
          Fecha: 'TOTAL',
          Ingresos: this.formatAsEuro(totalIngresos),
          Gastos: this.formatAsEuro(totalGastos),
          Beneficios: this.formatAsEuro(totalBeneficios),
        });

        // Crea la hoja
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetNames[index] || `Sheet${index + 1}`);
      }
    });

    // Genera el archivo Excel como un blob
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Usa FileSaver para descargar el archivo
    saveAs(blob, `${fileName}.xlsx`);
  }

  // Formatea un número como euro
  private formatAsEuro(value: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  }
}
