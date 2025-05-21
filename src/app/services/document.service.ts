import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs'; // Added throwError
import { catchError, tap } from 'rxjs/operators'; // Added catchError, tap
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = 'http://localhost:8000'; // Replace with your backend URL

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  uploadDocument(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/documents/`, formData, { headers });
  }

  getDocuments(): Observable<any[]> {
    console.log('DocumentService: getDocuments() called.');
    const headers = this.getAuthHeaders(); // getToken() inside will log
    return this.http.get<any[]>(`${this.apiUrl}/documents/`, { headers }).pipe(
      tap(response => console.log('DocumentService: getDocuments() API response:', response)),
      catchError(error => {
        console.error('DocumentService: getDocuments() API error:', error);
        return throwError(() => error); // Re-throw to be caught by component
      })
    );
  }

  getDocument(documentId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/documents/${documentId}`, { headers });
  }

  deleteDocument(documentId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(`${this.apiUrl}/documents/${documentId}`, { headers });
  }

  triggerIngestion(documentId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/ingest/${documentId}`, {}, { headers });
  }

  getIngestionStatus(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/ingestion/status`, { headers });
  }

  downloadDocument(documentId: number): Observable<Blob> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/documents/${documentId}/download`, {
      headers,
      responseType: 'blob' // Important for file downloads
    });
  }
}
