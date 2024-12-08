import { Component, inject } from '@angular/core';
import { RequestService } from '../../services/request.service';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-get-statistics',
  imports: [],
  templateUrl: './get-statistics.component.html',
  styleUrl: './get-statistics.component.css'
})
export class GetStatisticsComponent {
  private request = inject(RequestService);
  statistics: any; // Esta propiedad contendrá los datos que recibimos del servicio
  error: string = ''; // Para manejar posibles errores

  ngOnInit(): void {
    const params = new HttpParams()
      .set('from', '1900-01-01T00:00:00Z')  // Asegúrate de que las fechas estén en el formato correcto
      .set('to', '2025-12-31T23:59:59Z');

    // Nos suscribimos al observable del servicio
    this.request.getStatistics(params).subscribe(
      (data) => {
        this.statistics = data; // Al recibir la respuesta, asignamos los datos
        console.log(data)
      },
      (error) => {
        this.error = 'Ocurrió un error al obtener los datos.'; // Manejo de errores
      }
    );
  }
}
