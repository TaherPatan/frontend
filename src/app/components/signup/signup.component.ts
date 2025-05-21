import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router'; // Import RouterLink
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink], // Add RouterLink here
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  username = '';
  email = '';
  password = '';
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) { }

  signup(): void {
    this.errorMessage = null; // Clear previous errors
    this.authService.signup(this.username, this.email, this.password).subscribe({
      next: (response) => {
        console.log('Signup successful', response);
        // Optionally redirect to login page after successful signup
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Signup failed', error);
        this.errorMessage = 'Signup failed. Please try again.';
        if (error.error && error.error.detail) {
          this.errorMessage = error.error.detail;
        }
      }
    });
  }
}
