import { Component, inject } from '@angular/core';
import { RequestService } from '../../services/request.service';
import { Observable } from 'rxjs';
import { FormatterService } from '../../services/formatter.service';
import { HttpParams } from '@angular/common/http';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { TotalStatistics } from '../../interfaces/total-statistics';
import { CommonModule } from '@angular/common'; // Importa CommonModule

@Component({
  selector: 'app-get-statistics',
  imports: [HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './get-statistics.component.html',
  styleUrl: './get-statistics.component.css',
  standalone: true,
})
export class GetStatisticsComponent {
  private request = inject(RequestService);
  protected formatter = inject(FormatterService);

  statistics$!: Observable<TotalStatistics>;
  statistics: any;
  error: string = ''; // Para manejar posibles errores

  ngOnInit(): void {
    const params = new HttpParams()
      .set('from', '1900-01-01T00:00:00Z')  // YYYY-MM-DDTHH:MM:SSZ
      .set('to', '2025-12-31T23:59:59Z');

    // Nos suscribimos al observable del servicio
    this.statistics$ = this.request.getStatistics(params);

    /* this.request.getStatistics(params).subscribe({
      next: this.handleUpdateResponse,
      error: this.handleError
    }); */

  }

  handleUpdateResponse(data: any): void {
    this.statistics = data; // Al recibir la respuesta, asignamos los datos
    console.log(this.statistics);
  }

  handleError(error: any): void {
    this.error = 'Ocurrió un error al obtener los datos.'; // Manejo de errores
    console.error(error);
  }
}
