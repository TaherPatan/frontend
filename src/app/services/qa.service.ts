import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class QaService {
  private apiUrl = 'http://localhost:8000'; // Replace with your backend URL

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAnswer(question: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { question: question };
    return this.http.post<any>(`${this.apiUrl}/qa`, body, { headers });
  }
}
