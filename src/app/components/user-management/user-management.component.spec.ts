import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserManagementComponent } from './user-management.component';
import { UserService } from '../../services/user.service';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

describe('UserManagementComponent', () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['getUsers', 'updateUserRole', 'deleteUser']);
    userServiceSpy.getUsers.and.returnValue(of([])); // Default mock

    await TestBed.configureTestingModule({
      imports: [UserManagementComponent, CommonModule, FormsModule],
      providers: [
        { provide: UserService, useValue: userServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getUsers on ngOnInit', () => {
    expect(userServiceSpy.getUsers).toHaveBeenCalled();
  });

  it('should populate users and selectedRole on successful getUsers call', () => {
    const dummyUsers = [
      { id: 1, username: 'user1', email: 'user1@example.com', is_active: true, role: 'viewer' },
      { id: 2, username: 'user2', email: 'user2@example.com', is_active: true, role: 'editor' }
    ];
    userServiceSpy.getUsers.and.returnValue(of(dummyUsers));

    component.getUsers();

    expect(component.users).toEqual(dummyUsers);
    expect(component.selectedRole[1]).toBe('viewer');
    expect(component.selectedRole[2]).toBe('editor');
    expect(component.errorMessage).toBeNull();
  });

  it('should set error message on failed getUsers call', () => {
    userServiceSpy.getUsers.and.returnValue(throwError(() => new Error('Failed to fetch users')));

    component.getUsers();

    expect(component.users).toEqual([]);
    expect(component.errorMessage).toBe('Failed to load users.');
  });

  it('should call updateUserRole on userService and update user role in list', () => {
    const userId = 1;
    const newRole = 'admin';
    component.users = [{ id: 1, username: 'user1', email: 'user1@example.com', is_active: true, role: 'viewer' }];
    component.selectedRole[userId] = newRole;
    userServiceSpy.updateUserRole.and.returnValue(of({ id: 1, username: 'user1', email: 'user1@example.com', is_active: true, role: newRole }));

    component.updateUserRole(userId);

    expect(userServiceSpy.updateUserRole).toHaveBeenCalledWith(userId, newRole);
    expect(component.users[0].role).toBe(newRole);
    expect(component.errorMessage).toBeNull();
  });

  it('should set error message on failed updateUserRole call', () => {
    const userId = 1;
    const newRole = 'admin';
    component.users = [{ id: 1, username: 'user1', email: 'user1@example.com', is_active: true, role: 'viewer' }];
    component.selectedRole[userId] = newRole;
    userServiceSpy.updateUserRole.and.returnValue(throwError(() => new Error('Failed to update role')));

    component.updateUserRole(userId);

    expect(component.errorMessage).toBe('Failed to update user role.');
    expect(component.users[0].role).toBe('viewer'); // Role should not be updated on failure
  });

  it('should call deleteUser on userService and remove user from list', () => {
    const userId = 1;
    component.users = [{ id: 1, username: 'user1', email: 'user1@example.com', is_active: true, role: 'viewer' }];
    userServiceSpy.deleteUser.and.returnValue(of({}));

    component.deleteUser(userId);

    expect(userServiceSpy.deleteUser).toHaveBeenCalledWith(userId);
    expect(component.users.length).toBe(0);
    expect(component.errorMessage).toBeNull();
  });

  it('should set error message on failed deleteUser call', () => {
    const userId = 1;
    component.users = [{ id: 1, username: 'user1', email: 'user1@example.com', is_active: true, role: 'viewer' }];
    userServiceSpy.deleteUser.and.returnValue(throwError(() => new Error('Failed to delete user')));

    component.deleteUser(userId);

    expect(component.errorMessage).toBe('Failed to delete user.');
    expect(component.users.length).toBe(1); // User should not be removed on failure
  });
});
