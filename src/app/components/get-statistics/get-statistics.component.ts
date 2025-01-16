import { Component, inject } from '@angular/core';
import { RequestService } from '../../services/request.service';
import { Observable, of } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { ITotalStatistics } from '../../interfaces/total-statistics';
import { CommonModule } from '@angular/common';
import { DailyLogTableComponent } from "../layouts/daily-log-table/daily-log-table.component"; // Importa CommonModule
import { LoaderService } from '../../services/loader.service';
import { ErrorService } from '../../services/error.service';
import { NotificationComponent } from '../notification/notification.component';

@Component({
  selector: 'app-get-statistics',
  imports: [HeaderComponent, FooterComponent, CommonModule, DailyLogTableComponent, NotificationComponent],
  templateUrl: './get-statistics.component.html',
  styleUrl: './get-statistics.component.css',
  standalone: true,
})
export class GetStatisticsComponent {
  private request = inject(RequestService);
  private loader = inject(LoaderService);
  private errorService = inject(ErrorService);

  filter_selected: string = "Todos los datos";
  isOpen: boolean = true;
  statistics$!: Observable<ITotalStatistics>;
  statistics: any;
  error: string = ''; // Para manejar posibles errores
  selectedShop: any = undefined; // Almacena el UUID emitido desde el header
  from: any = "1900-01-01T00:00:00Z";
  from_copy: any;
  to: any = "2055-12-31T23:59:59Z";
  shops$!: Observable<any>;

  updateFromTo(time: string): void {
    let days = 0;
    let months = 0;
    let years = 0;

    let suffix_time_allowed = ['a', 'm', 's', 'd']
    if (time != 'all' && time.length == 2 && typeof Number(time.charAt(0)) === 'number' && typeof time.charAt(1) === 'string' && suffix_time_allowed.includes(time.charAt(1))) {

      switch (time.charAt(1)) {
        case 'a':
          years = Number(time.charAt(0));

          years > 1 ?
            this.filter_selected = "Últimos "+years+" años"
            :
            this.filter_selected = "Último año";

          break;
        case 'm':
          months = Number(time.charAt(0));

          months > 1 ?
            this.filter_selected = "Últimos " + months + " meses"
            :
            this.filter_selected = "Último mes";
          break;
        case 'd':
          days = Number(time.charAt(0));

          days > 1 ?
            this.filter_selected = "Últimos " + days + " días"
            :
            this.filter_selected = "Ayer";
          break;
        case 's':
          days = Number(time.charAt(0)) * 7;

          days > 1 ?
            this.filter_selected = "Últimas " + Number(time.charAt(0)) + " semanas"
            :
            this.filter_selected = "Última semana";
          break;
      }

      const now = new Date();
      const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 23, 59, 59)); // Final del día actual
      const from = new Date(Date.UTC(now.getUTCFullYear() - years, now.getUTCMonth() - months, now.getUTCDate() - days - 1, 0, 0, 0)); // Inicio del día desde hace `days`
      this.from_copy = new Date(Date.UTC(now.getUTCFullYear() - years, now.getUTCMonth() - months, now.getUTCDate() - days, 0, 0, 0));;

      // Formatear las fechas en el formato exacto requerido
      const formatDate = (date: Date): string => {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Mes (0-11) + 1
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
      };


      this.from = formatDate(from);
      this.to = formatDate(to);

    } else {
      this.resetFromTo()
    }


    this.updateShop(this.selectedShop)
  }

  setShops(shops: Observable<any>) {
    this.shops$ = shops;
  }

  changeIsOpen(): void {
    this.isOpen = !this.isOpen
  }

  setShop(shop: any) {
    this.selectedShop = shop;
    this.resetFromTo();
    this.updateShop(shop);
  }

  private resetFromTo() {
    this.filter_selected = "Todos los datos";
    this.from = "1900-01-01T00:00:00Z";
    this.to = "2055-12-31T23:59:59Z";
  }

  // Método para actualizar el UUID desde el header
  updateShop(shop: any) {

    const params = new HttpParams()
      .set('from', this.from)  // YYYY-MM-DDTHH:MM:SSZ
      .set('to', this.to);

    this.loader.show();
    this.request.getStatistics(params).subscribe({
      next: (response) => {
        if (shop === undefined) {
          this.statistics$ = of(response);
        } else {
          const matchedShop = response.shopsFinancialStatistics.find((element: any) => shop.id === element.id);
          this.statistics$ = of(matchedShop || {}); // Asegurarse de que siempre se emita algo, incluso vacío
        }
      },
      error: (error) => {
        console.log(error);
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
      }
    });
  }

  ngOnInit(): void {

    this.updateShop(this.selectedShop)
    this.errorService.clearErrorMessage();

  }
}
