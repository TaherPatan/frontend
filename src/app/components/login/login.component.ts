import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router'; // Import RouterLink
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink], // Add RouterLink here
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) { }

  login(): void {
    console.log('LoginComponent: login() method called.'); // Basic log
    this.errorMessage = null; // Clear previous errors
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        this.router.navigate(['/documents']); // Redirect to documents page after login
      },
      error: (error) => {
        console.error('Login failed in component:', error); // More specific console log
        if (error && error.error && typeof error.error.detail === 'string') {
          this.errorMessage = `Login failed: ${error.error.detail}`;
        } else if (error && typeof error.message === 'string') {
          this.errorMessage = `Login failed: ${error.message}`;
        } else {
          this.errorMessage = 'Login failed. Please check credentials or see console for details.';
        }
      }
    });
  }
}
