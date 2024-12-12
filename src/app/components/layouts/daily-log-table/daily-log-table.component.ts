import { Component, inject } from '@angular/core';
import { RequestService } from '../../../services/request.service';
import { Observable } from 'rxjs';
import { FormatterService } from '../../../services/formatter.service';
import { ITotalStatistics } from '../../../interfaces/total-statistics';
import { CommonModule } from '@angular/common';
import { IAddAcounting } from '../../../interfaces/add-acounting';

@Component({
  selector: 'app-daily-log-table',
  imports: [CommonModule],
  templateUrl: './daily-log-table.component.html',
  styleUrl: './daily-log-table.component.css',
  standalone: true,
})

export class DailyLogTableComponent {
  private request = inject(RequestService);
  protected formatter = inject(FormatterService);

  log$!: Observable<IAddAcounting>;
  log: any;
  error: string = ''; // Para manejar posibles errores

  ngOnInit(): void {

    this.log$ = this.request.addAcounting();

  }
}
