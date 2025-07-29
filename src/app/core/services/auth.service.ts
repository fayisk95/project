import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Mock users for demonstration
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@crm.com',
      name: 'Admin User',
      role: 'admin',
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '2',
      email: 'manager@crm.com',
      name: 'Manager User',
      role: 'manager',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: '3',
      email: 'user@crm.com',
      name: 'Regular User',
      role: 'user',
      avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    }
  ];

  constructor() {
    // Check for existing session on service initialization
    this.checkExistingSession();
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    // Simulate API call with delay
    return of(null).pipe(
      delay(1500),
      map(() => {
        // Find user by email
        const user = this.mockUsers.find(u => u.email === credentials.email);
        
        // Simple password validation (in real app, this would be handled by backend)
        if (user && credentials.password === 'password123') {
          const token = this.generateMockToken();
          
          // Store in localStorage
          localStorage.setItem('auth_token', token);
          localStorage.setItem('current_user', JSON.stringify(user));
          
          // Update subjects
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          
          return {
            success: true,
            user,
            token,
            message: 'Login successful'
          };
        } else {
          return {
            success: false,
            message: 'Invalid email or password'
          };
        }
      })
    );
  }

  logout(): void {
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    
    // Update subjects
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private checkExistingSession(): void {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('current_user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        // Invalid stored data, clear it
        this.logout();
      }
    }
  }

  private generateMockToken(): string {
    return 'mock_jwt_token_' + Math.random().toString(36).substr(2, 9);
  }

  // Helper method to get demo credentials
  getDemoCredentials(): { email: string; password: string; role: string }[] {
    return [
      { email: 'admin@crm.com', password: 'password123', role: 'Admin' },
      { email: 'manager@crm.com', password: 'password123', role: 'Manager' },
      { email: 'user@crm.com', password: 'password123', role: 'User' }
    ];
  }
}