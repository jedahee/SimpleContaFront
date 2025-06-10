import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class DailyAccountingService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createDailyAccounting(formData: any): Observable<any> {
    return this.http.post(this.apiUrl + '/api/shop', formData);
  }

  deleteDailyAccounting(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/shop/${id}`);
  }

  getDailyAccounting(id: string): Observable<any> {
    return this.http.get(this.apiUrl + '/api/accounting/' + id);
  }

  updateDailyAccounting(id: string, formData: any) {
    return this.http.put(this.apiUrl + '/api/shop/' + id, formData);
  }
}
