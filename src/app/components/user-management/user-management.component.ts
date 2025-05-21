import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  errorMessage: string | null = null;
  selectedRole: { [key: number]: string } = {}; // To hold selected role for each user

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        // Initialize selectedRole with current user roles
        this.users.forEach(user => {
          this.selectedRole[user.id] = user.role;
        });
      },
      error: (error) => {
        console.error('Error fetching users', error);
        this.errorMessage = 'Failed to load users.';
      }
    });
  }

  updateUserRole(userId: number): void {
    const role = this.selectedRole[userId];
    if (!role) {
      this.errorMessage = 'Please select a role.';
      return;
    }

    this.userService.updateUserRole(userId, role).subscribe({
      next: (response) => {
        console.log('User role updated', response);
        // Update the user in the local array
        const index = this.users.findIndex(user => user.id === userId);
        if (index !== -1) {
          this.users[index].role = response.role;
        }
      },
      error: (error) => {
        console.error('Error updating user role', error);
        this.errorMessage = 'Failed to update user role.';
      }
    });
  }

  deleteUser(userId: number): void {
    this.userService.deleteUser(userId).subscribe({
      next: (response) => {
        console.log('User deleted', response);
        this.users = this.users.filter(user => user.id !== userId);
      },
      error: (error) => {
        console.error('Error deleting user', error);
        this.errorMessage = 'Failed to delete user.';
      }
    });
  }
}
