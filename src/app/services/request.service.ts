import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { ITotalStatistics } from '../interfaces/total-statistics';
import { IAddAcounting } from '../interfaces/add-acounting';

@Injectable({
  providedIn: 'root',
})

export class RequestService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getStatistics(params: HttpParams): Observable<ITotalStatistics> {
    const MOCK_STATISTICS = {
      accumulatedTotalExpense: 50000,
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

    return this.http.get<ITotalStatistics>(this.apiUrl + '/api/statistics', { params }); // http://localhost:8080/api/statistics
    //return of(MOCK_STATISTICS);
  }

  getAcounting(params: HttpParams): Observable<IAddAcounting[]> {


    return this.http.get<any>(this.apiUrl + '/api/accounting', { params }); // http://localhost:8080/api/accounting

    //return of(MOCK_ACCOUNTING_DATA);
  }

  getShops(): Observable<any[]> {


    return this.http.get<any>(this.apiUrl + '/api/shop/all'); // http://localhost:8080/api/shop/all

    //return of(MOCK_ACCOUNTING_DATA);
  }
}
