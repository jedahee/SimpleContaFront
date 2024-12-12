import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { of } from 'rxjs';
import { ITotalStatistics } from '../interfaces/total-statistics';
import { IAddAcounting } from '../interfaces/add-acounting';

@Injectable({
  providedIn: 'root',
})

export class RequestService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getStatistics(params: HttpParams): Observable<ITotalStatistics> {
    const MOCK_STATISTICS = {
      accumulatedTotalExpense: 5000,
      accumulatedTotalIncome: 15000,
      accumulatedTotalPercentageProfit: 30,
      accumulatedTotalProfit: 10000,
      accumulatedStartToEndDateExpense: 2000,
      accumulatedStartToEndDateIncome: 6000,
      accumulatedStartToEndDatePercentageProfit: 33.33,
      accumulatedStartToEndDateProfit: 4000,
      endDate: '2024-12-31',
      shopsFinancialStatistics: [
        { shopId: 1, expense: 1000, income: 3000, profit: 2000 },
        { shopId: 2, expense: 1500, income: 4500, profit: 3000 }
      ]
    };

    // return this.http.get(this.apiUrl + '/api/statistics', { params }); // http://localhost:8080/api/statistics
    return of(MOCK_STATISTICS);
  }

  addAcounting(): Observable<IAddAcounting> {
    const MOCK_ACCOUNTING_DATA: IAddAcounting = {
      shopId: "0c5fbfdf-6e72-4481-8e71-e93fc5a751cb",
      income: [
        {
          id: 1,
          amount: 955.1,
          incomingConcept: "DIRECT_SALE",
          description: "venta al publico"
        },
        {
          id: 2,
          amount: 21.4,
          incomingConcept: "DIRECT_SALE",
          description: "Pedido juan"
        },
        {
          id: 3,
          amount: 194.2,
          incomingConcept: "DIRECT_SALE",
          description: "Pedido luis"
        }
      ],
      expense: [
        {
          id: 4,
          amount: 100.3,
          expensingConcept: "DIRECT_BUY",
          description: "compra huevos"
        }
      ],
      date: "2024-10-11T05:47:29.886Z"
    };

    return of(MOCK_ACCOUNTING_DATA);
  }
}
