import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { of } from 'rxjs';

interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  role: string;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify(); // Ensure that no outstanding requests are pending
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store token on successful login', () => {
    const dummyToken = { access_token: 'fake-token' };
    const username = 'testuser';
    const password = 'password123';

    spyOn(service as any, 'fetchCurrentUser').and.returnValue(of({})); // Mock fetchCurrentUser

    service.login(username, password).subscribe(response => {
      expect(response).toEqual(dummyToken);
    });

    const req = httpTestingController.expectOne('http://localhost:8000/token');
    expect(req.request.method).toBe('POST');
    req.flush(dummyToken);

    expect(localStorage.getItem('access_token')).toBe('fake-token');
  });

  it('should remove token on logout', () => {
    localStorage.setItem('access_token', 'fake-token');
    service.logout();
    expect(localStorage.getItem('access_token')).toBeNull();
    service.currentUser.subscribe(user => {
      expect(user).toBeNull();
    });
  });

  it('should return true for isAuthenticated when token exists', () => {
    localStorage.setItem('access_token', 'fake-token');
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should return false for isAuthenticated when no token exists', () => {
    localStorage.removeItem('access_token');
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should fetch and set current user', () => {
    const dummyUser = { id: 1, username: 'testuser', email: 'test@example.com', is_active: true, role: 'viewer' };
    localStorage.setItem('access_token', 'fake-token');

    (service as any).fetchCurrentUser().subscribe((user: User) => {
      expect(user).toEqual(dummyUser);
    });

    const req = httpTestingController.expectOne('http://localhost:8000/users/me/');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    req.flush(dummyUser);

    service.currentUser.subscribe(user => {
      expect(user).toEqual(dummyUser);
    });
  });

  it('should load current user on initialization if token exists', () => {
    const dummyUser = { id: 1, username: 'testuser', email: 'test@example.com', is_active: true, role: 'viewer' };
    localStorage.setItem('access_token', 'fake-token');

    // Re-create the service to trigger loadCurrentUser
    service = TestBed.inject(AuthService);

    const req = httpTestingController.expectOne('http://localhost:8000/users/me/');
    expect(req.request.method).toBe('GET');
    req.flush(dummyUser);

    service.currentUser.subscribe(user => {
      expect(user).toEqual(dummyUser);
    });
  });

  it('should not load current user on initialization if no token exists', () => {
    localStorage.removeItem('access_token');

    // Re-create the service
    service = TestBed.inject(AuthService);

    httpTestingController.expectNone('http://localhost:8000/users/me/'); // Ensure no request is made

    service.currentUser.subscribe(user => {
      expect(user).toBeNull();
    });
  });

  it('should return current user observable', () => {
    const dummyUser = { id: 1, username: 'testuser', email: 'test@example.com', is_active: true, role: 'viewer' };
    (service as any).currentUserSubject.next(dummyUser); // Manually set user

    service.getCurrentUser().subscribe(user => {
      expect(user).toEqual(dummyUser);
    });
  });

  it('should return current user role observable', () => {
    const dummyUser = { id: 1, username: 'testuser', email: 'test@example.com', is_active: true, role: 'admin' };
    (service as any).currentUserSubject.next(dummyUser); // Manually set user

    service.getCurrentUserRole().subscribe(role => {
      expect(role).toBe('admin');
    });
  });

  it('should return null for current user role if no user', () => {
    (service as any).currentUserSubject.next(null); // Manually set user to null

    service.getCurrentUserRole().subscribe(role => {
      expect(role).toBeNull();
    });
  });
});
