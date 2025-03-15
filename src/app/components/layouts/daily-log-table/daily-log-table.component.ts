import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RequestService } from '../../../services/request.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ErrorService } from '../../../services/error.service';
import { forkJoin } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { LoaderService } from '../../../services/loader.service';
import { NotificationComponent } from '../../notification/notification.component';
import { ExcelService } from '../../../services/excel.service';
import { Accordion } from 'flowbite';

@Component({
  selector: 'app-daily-log-table',
  imports: [CommonModule, NotificationComponent],
  templateUrl: './daily-log-table.component.html',
  styleUrl: './daily-log-table.component.css',
  standalone: true,
})
export class DailyLogTableComponent implements OnChanges {
  private request = inject(RequestService);
  private loader = inject(LoaderService);
  private errorService = inject(ErrorService);
  private excelService = inject(ExcelService);

  isAccordionOpen: boolean[] = []; // Estado inicial del acordeón
  shops$!: Observable<any[]>;
  logs: any;
  logs_excel: any;
  error: string = ''; // Para manejar posibles errores

  @Input() shopSelected!: any;
  @Input() shopsObservable!: any;
  @Input() from: any;
  @Input() to: any;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['shopSelected'] || changes['from'] || changes['to']) {
      this.isAccordionOpen.forEach((accordion, index) => {
        this.isAccordionOpen[index] = false;
      })
      if (this.shopSelected) {
        this.fetchDataForSingleShop(); // Fetch para un único shop
      } else {
        this.fetchDataForAllShops(); // Fetch para todos los shops
      }
    }
  }

  downloadExcel(): void {
    this.excelService.exportToExcel(this.logs_excel, 'Cuentas tiendas');
  }


  ngOnInit(): void {
    if (!this.shopSelected) {
      this.fetchDataForAllShops(); // Inicialización sin selección de shop
    }
    this.errorService.clearErrorMessage();

  }

  // Lógica para obtener datos de todas las tiendas
  private fetchDataForAllShops(): void {
    this.shops$ = this.shopsObservable;
    this.loader.show(); // Mostrar loader

    this.shops$
      .pipe(
        map((shops: any[]) => shops.map(shop => shop.id)), // Extraer los IDs de las tiendas
        mergeMap((ids: string[]) => {
          const requests = ids.map(id => {
            const params = new HttpParams()
              .set('from', this.from)
              .set('to', this.to)
              .set('id', id);

            return this.request.getAcounting(params); // Llama a tu servicio
          });
          return forkJoin(requests);
        })
      )
      .subscribe({
        next: (responses) => {
          this.logs = this.processResponses(responses);
          this.logs_excel = responses;
        },
        error: (error) => {
          const message = this.errorService.getErrorMessage(error.status, error.message);
          this.errorService.setErrorMessage(message);
          setTimeout(() => {
            this.loader.hide();
          }, 0);
        },
        complete: () => {
          setTimeout(() => {
            this.loader.hide();
          }, 0);
        },
      });
  }

  // Lógica para obtener datos de una sola tienda
  private fetchDataForSingleShop(): void {
    this.loader.show(); // Mostrar loader

    const params = new HttpParams()
      .set('from', this.from)
      .set('to', this.to)
      .set('id', this.shopSelected.id);

    this.request.getAcounting(params).subscribe({
      next: (response) => {
        this.logs = this.processResponses([response]);
      },
      error: (error) => {
        const message = this.errorService.getErrorMessage(error.status, error.message);
        this.errorService.setErrorMessage(message);
        this.loader.hide();
      },
      complete: () => {
        this.loader.hide();
      },
    });
  }

  // Procesar respuestas para combinar datos
  private processResponses(responses: any[][]): any[] {

    return responses
      .map((subArray, index) =>
        subArray.map(item => {
          const mergedTransactions = [
            ...item.listOfIncomes.map((income: any) => ({
              ...income,
              type: 'income' // Identificar como ingreso
            })),
            ...item.listOfExpenses.map((expense: any) => ({
              ...expense,
              type: 'expense' // Identificar como gasto
            })),
          ];

          return {
            ...item, // Mantener todas las propiedades originales del item
            shop: responses.length > 1 ? index === 1 ? 'Villegas' : 'Santa Aurelia' : this.shopSelected.name, // Asignar la propiedad "source"
            transactions: mergedTransactions // Agregar el array combinado
          };
        })
      )
      .flat() // Combina los subarrays en uno solo
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Ordenar por fecha
  }

  toggleAccordion(id: number): void {
    this.isAccordionOpen[id] = !this.isAccordionOpen[id]; // Alternar el estado abierto/cerrado
  }
}
