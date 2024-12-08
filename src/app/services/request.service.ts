import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})

export class RequestService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getStatistics(params: HttpParams): Observable<any> {
    return this.http.get(this.apiUrl + '/api/statistics', { params }); // http://localhost:8080/api/statistics
  }
}
