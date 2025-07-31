import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="login-container">
      <div class="login-box">
        <h2>¡Bienvenido de nuevo!</h2>
        <div class="user-type-toggle">
          <button 
            [class.active]="userType === 'jobseeker'"
            (click)="userType = 'jobseeker'">
            Buscador de Empleo
          </button>
          <button 
            [class.active]="userType === 'employer'"
            (click)="userType = 'employer'">
            Empleador
          </button>
        </div>
        
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Usuario</label>
            <input 
              type="text" 
              id="username" 
              [(ngModel)]="username" 
              name="username" 
              required
              placeholder="Ingresa tu usuario">
          </div>
          
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              [(ngModel)]="password" 
              name="password" 
              required
              placeholder="Ingresa tu contraseña">
          </div>

          <button type="submit" [disabled]="!username || !password">
            Iniciar sesión como {{ userType === 'jobseeker' ? 'Buscador de Empleo' : 'Empleador' }}
          </button>
        </form>

        <div class="error-message" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: darkgray;
    }

    .login-box {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }

    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 1.5rem;
    }

    .user-type-toggle {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .user-type-toggle button {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ddd;
      background: white;
      color: #666;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .user-type-toggle button.active {
      background: #4CAF50;
      color: white;
      border-color: #4CAF50;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #666;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    input:focus {
      outline: none;
      border-color: #4CAF50;
    }

    button[type="submit"] {
      width: 100%;
      padding: 0.75rem;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    button[type="submit"]:hover:not(:disabled) {
      background-color: #45a049;
    }

    button[type="submit"]:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    .error-message {
      color: #f44336;
      text-align: center;
      margin-top: 1rem;
    }
  `]
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  userType: 'jobseeker' | 'employer' = 'jobseeker';

  constructor(private router: Router, private apiService: ApiService) {}

  onSubmit() {
    this.errorMessage = '';
    
    this.apiService.login(this.username, this.password, this.userType).subscribe({
      next: (response) => {
        if (this.userType === 'employer') {
          this.router.navigate(['/employers']);
        } else {
          this.router.navigate(['/disabilities']);
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Login failed. Please try again.';
      }
    });
  }
} 