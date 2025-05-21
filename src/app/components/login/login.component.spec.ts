import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call authService.login and navigate on successful login', () => {
    authServiceSpy.login.and.returnValue(of({ access_token: 'fake-token' }));
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');

    component.username = 'testuser';
    component.password = 'password123';
    component.login();

    expect(authServiceSpy.login).toHaveBeenCalledWith('testuser', 'password123');
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
    expect(component.errorMessage).toBeNull();
  });

  it('should display error message on failed login', () => {
    authServiceSpy.login.and.returnValue(throwError(() => new Error('Login failed')));

    component.username = 'testuser';
    component.password = 'password123';
    component.login();

    expect(authServiceSpy.login).toHaveBeenCalledWith('testuser', 'password123');
    expect(component.errorMessage).toBe('Login failed. Please check your username and password.');
  });

  it('should bind username and password inputs', () => {
    const usernameInput: HTMLInputElement = fixture.nativeElement.querySelector('#username');
    const passwordInput: HTMLInputElement = fixture.nativeElement.querySelector('#password');

    usernameInput.value = 'testuser';
    passwordInput.value = 'password123';

    usernameInput.dispatchEvent(new Event('input'));
    passwordInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    expect(component.username).toBe('testuser');
    expect(component.password).toBe('password123');
  });
});
