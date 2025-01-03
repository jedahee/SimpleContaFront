import { Component, inject } from '@angular/core';
import { RequestService } from '../../../services/request.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IAddAcounting } from '../../../interfaces/add-acounting';
import { NgOptimizedImage } from '@angular/common';
import { forkJoin } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-daily-log-table',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './daily-log-table.component.html',
  styleUrl: './daily-log-table.component.css',
  standalone: true,
})

export class DailyLogTableComponent {
  private request = inject(RequestService);
  isAccordionOpen: boolean[] = []; // Estado inicial del acordeón
  shops$!: Observable<any[]>;
  logs: any;
  error: string = ''; // Para manejar posibles errores

  ngOnInit(): void {
    // Realiza la primera petición para obtener los shops
    this.shops$ = this.request.getShops();

    // Primera petición para obtener los shops
    this.shops$
      .pipe(
        // Extraer los IDs de los shops
        map((shops: any[]) => shops.map(shop => shop.id)),

        // Realizar una petición por cada ID
        mergeMap((ids: string[]) => {
          // Crear un array de observables (una petición por ID)
          const requests = ids.map(id => {
            const params = new HttpParams()
              .set('from', '1900-01-01T00:00:00Z')
              .set('to', '2025-12-31T23:59:59Z')
              .set('id', id);

            return this.request.getAcounting(params); // Llama a tu servicio
          });

          // Combina todas las respuestas en un único array
          return forkJoin(requests);
        })
      )
      .subscribe({
        next: (responses) => {
          // Asumiendo que `responses` contiene tus subarrays originales
          this.logs = responses
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
                  }))
                ];

                return {
                  ...item, // Mantener todas las propiedades originales del item
                  shop: index === 0 ? 'Villegas' : 'Santa Aurelia', // Asignar la propiedad "source"
                  transactions: mergedTransactions // Agregar el array combinado
                };
              })
            )
            .flat() // Combina los subarrays en uno solo
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Ordenar por fecha

          console.log(this.logs); // Aquí tienes las respuestas ordenadas con transacciones fusionadas

        },
        error: (error) => {
          console.error('Error en la cadena de peticiones:', error);
        },
        complete: () => {
          console.log('Todas las peticiones han finalizado');
        }
      });
  }


  toggleAccordion(id:number) {
    this.isAccordionOpen[id] = !this.isAccordionOpen[id]; // Alternar el estado abierto/cerrado
  }
}
