import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'; // Import HttpParams
import { Observable, BehaviorSubject, of, throwError } from 'rxjs'; // Import throwError
import { tap, catchError, map, switchMap } from 'rxjs/operators'; // Added switchMap

interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000'; // Replace with your backend URL
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();
    // Attempt to load user from storage on service initialization
    this.loadCurrentUser();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  login(username: string, password: string): Observable<any> {
    console.log('AuthService: login() method called with username:', username); // Basic log
    // Data should be sent as x-www-form-urlencoded for OAuth2PasswordRequestForm
    const body = new HttpParams()
      .set('username', username)
      .set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<any>(`${this.apiUrl}/token`, body.toString(), { headers }).pipe(
      // Use switchMap to chain the fetchCurrentUser call
      // and ensure login observable only emits after user is fetched
      switchMap(response => {
        if (response && response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          // fetchCurrentUser already updates currentUserSubject and returns an Observable<User>
          // We map it to the original response so the component still gets the token response if needed
          return this.fetchCurrentUser().pipe(
            map(user => {
              console.log('AuthService.login: User fetched successfully after token set.', user);
              return response; // Return original token response
            }),
            catchError(fetchError => {
              console.error('AuthService.login: Error fetching user after setting token:', fetchError);
              // Even if user fetch fails, token was set. Decide if this is a "login success"
              // For now, let's propagate the original response but log the error.
              // Or, we could throw an error here to make login fail if user fetch is critical.
              // return throwError(() => fetchError);
              return of(response); // Or return the original response, component will see login as "successful"
            })
          );
        } else {
          console.warn('Access token not received in login response:', response);
          return throwError(() => new Error('Access token not received'));
        }
      }),
      catchError(error => {
        console.error('Login HTTP request failed or user fetch failed:', error);
        localStorage.removeItem('access_token'); // Ensure token is cleared on any login pipeline error
        this.currentUserSubject.next(null);    // Ensure user is cleared
        return throwError(() => error); // Re-throw the error to be caught by the component
      })
    );
  }

  signup(username: string, email: string, password: string): Observable<any> {
    const user = { username, email, password };
    // For signup, FastAPI typically expects JSON, so default Content-Type is fine
    return this.http.post<any>(`${this.apiUrl}/users/`, user);
  }

  getToken(): string | null {
    // if (this.isBrowser()) { // isBrowser() check removed as it's not defined in this service
      const token = localStorage.getItem('access_token');
      console.log('AuthService.getToken: Retrieved from localStorage:', token);
      return token;
    // }
    // console.log('AuthService.getToken: Not in browser or localStorage undefined.'); // This part is unreachable without isBrowser
    // return null;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.currentUserSubject.next(null); // Clear current user
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const result = !!token;
    console.log(`AuthService.isAuthenticated: Called. Token present: ${result}. Token value: ${token}`);
    return result;
  }

  private fetchCurrentUser(): Observable<User> {
    const headers = this.getAuthHeaders();
    console.log('AuthService: Attempting to fetch current user with headers:', headers); // Log attempt
    return this.http.get<User>(`${this.apiUrl}/users/me/`, { headers }).pipe(
      tap(user => {
        console.log('AuthService: Successfully fetched current user:', user); // Log success
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('AuthService: Error fetching current user in service:', error); // Log error
        this.logout(); // Log out if fetching user fails (e.g., invalid token)
        return throwError(() => error); // Propagate the error
      })
    );
  }

  private loadCurrentUser(): void {
    if (this.isAuthenticated()) { // This will now log its check
      console.log('AuthService: Loading current user on service init because isAuthenticated is true.');
      this.fetchCurrentUser().subscribe({
        next: (user) => console.log('AuthService: Current user loaded on init:', user),
        error: (err) => console.error('AuthService: Error loading current user on init:', err)
      });
    } else {
      console.log('AuthService: Not loading current user on service init because isAuthenticated is false.');
    }
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser;
  }

  getCurrentUserRole(): Observable<string | null> {
    console.log('AuthService.getCurrentUserRole: Called.');
    return this.currentUser.pipe(
      map((user: User | null) => {
        const role = user ? user.role : null;
        console.log('AuthService.getCurrentUserRole: Mapping user to role. User:', user, 'Role:', role);
        return role;
      })
    );
  }
}
