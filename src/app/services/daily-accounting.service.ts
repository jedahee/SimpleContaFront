import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
}
