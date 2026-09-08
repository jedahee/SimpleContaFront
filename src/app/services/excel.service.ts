import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx-js-style';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() {}

  public async exportToExcelWithFormat(data: any[], fileName: string): Promise<void> {
    const sheetNames = ['Santa Aurelia', 'Villegas'];
    const workbook = new ExcelJS.Workbook();

    data.forEach((item, index) => {
      if (!Array.isArray(item) || item.length === 0) return;

      const worksheet = workbook.addWorksheet(sheetNames[index] || `Sheet${index + 1}`);

      // Agregar cabeceras con estilos
      worksheet.columns = [
        { header: 'Fecha', key: 'date', width: 15 },
        { header: 'Ingresos', key: 'income', width: 15 },
        { header: 'Gastos', key: 'expense', width: 15 },
        { header: 'Beneficios', key: 'profit', width: 15 },
      ];

      worksheet.getRow(1).font = { bold: true }; // Cabecera en negrita

      // Ordenar por fecha descendente
      const sortedData = item.sort(
        (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Agregar datos fila por fila
      sortedData.forEach((entry: any) => {
        worksheet.addRow({
          date: new Date(entry.date).toLocaleDateString(),
          income: entry.dailyIncome,
          expense: entry.dailyExpense,
          profit: entry.dailyProfit
        });
      });

      // Agregar fila de totales
      const totalIngresos = item.reduce((sum: number, e: any) => sum + e.dailyIncome, 0);
      const totalGastos = item.reduce((sum: number, e: any) => sum + e.dailyExpense, 0);
      const totalBeneficios = item.reduce((sum: number, e: any) => sum + e.dailyProfit, 0);

      const totalRow = worksheet.addRow({
        date: 'TOTAL',
        income: totalIngresos,
        expense: totalGastos,
        profit: totalBeneficios
      });

      // Estilo para fila TOTAL
      totalRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD9D9D9' }, // gris claro
        };
      });

      // Aplicar formato moneda a columnas de ingreso, gasto y beneficio
      const currencyFormat = '#,##0.00 €';
      worksheet.getColumn('income').numFmt = currencyFormat;
      worksheet.getColumn('expense').numFmt = currencyFormat;
      worksheet.getColumn('profit').numFmt = currencyFormat;
    });

    // Exportar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `${fileName}.xlsx`);
  }

  public exportToExcel(data: any[], fileName: string): void {
    // Define nombres de las hojas
    const sheetNames = ['Santa Aurelia', 'Villegas'];

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
        const worksheet = XLSX.utils.json_to_sheet(worksheetData, {
          header: ['Fecha', 'Ingresos', 'Gastos', 'Beneficios']
        });

        // Ajustar ancho de columnas (15 caracteres aprox)
        worksheet['!cols'] = [
          { wch: 12 }, // Fecha
          { wch: 15 }, // Ingresos
          { wch: 15 }, // Gastos
          { wch: 15 }, // Beneficios
        ];

        // Añadir la hoja al libro
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
