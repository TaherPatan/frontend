import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SignupComponent } from './signup.component';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['signup']);

    await TestBed.configureTestingModule({
      imports: [SignupComponent, FormsModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call authService.signup and navigate to login on successful signup', () => {
    authServiceSpy.signup.and.returnValue(of({}));
    const navigateSpy = spyOn(router, 'navigate');

    component.username = 'testuser';
    component.email = 'test@example.com';
    component.password = 'password123';
    component.signup();

    expect(authServiceSpy.signup).toHaveBeenCalledWith('testuser', 'test@example.com', 'password123');
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    expect(component.errorMessage).toBeNull();
  });

  it('should display error message on failed signup', () => {
    authServiceSpy.signup.and.returnValue(throwError(() => new Error('Signup failed')));

    component.username = 'testuser';
    component.email = 'test@example.com';
    component.password = 'password123';
    component.signup();

    expect(authServiceSpy.signup).toHaveBeenCalledWith('testuser', 'test@example.com', 'password123');
    expect(component.errorMessage).toBe('Signup failed. Please try again.');
  });

  it('should display backend error message on failed signup if available', () => {
    const backendError = { error: { detail: 'Email already registered' } };
    authServiceSpy.signup.and.returnValue(throwError(() => backendError));

    component.username = 'testuser';
    component.email = 'test@example.com';
    component.password = 'password123';
    component.signup();

    expect(authServiceSpy.signup).toHaveBeenCalledWith('testuser', 'test@example.com', 'password123');
    expect(component.errorMessage).toBe('Email already registered');
  });

  it('should bind username, email, and password inputs', () => {
    const usernameInput: HTMLInputElement = fixture.nativeElement.querySelector('#username');
    const emailInput: HTMLInputElement = fixture.nativeElement.querySelector('#email');
    const passwordInput: HTMLInputElement = fixture.nativeElement.querySelector('#password');

    usernameInput.value = 'testuser';
    emailInput.value = 'test@example.com';
    passwordInput.value = 'password123';

    usernameInput.dispatchEvent(new Event('input'));
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    expect(component.username).toBe('testuser');
    expect(component.email).toBe('test@example.com');
    expect(component.password).toBe('password123');
  });
});
