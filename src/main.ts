import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideRouter,
  RouterModule,
  Routes,
  withComponentInputBinding,
  Router,
  NavigationEnd,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { LoginComponent } from './app/login/login.component';
import { DisabilitiesComponent } from './app/disabilities/disabilities.component';
import { SkillsComponent } from './app/skills/skills.component';
import { AboutMeComponent } from './app/about-me/about-me.component';
import { JobRecommendationsComponent } from './app/job-recommendations/job-recommendations.component';
import { EmployersComponent } from './app/employers/employers.component';
import { SavedCandidatesComponent } from './app/saved-candidates/saved-candidates.component';
import { ApiService } from './app/services/api.service';
import { FormsModule } from '@angular/forms';
import { InboxComponent } from './app/inbox/inbox.component';
import { EmployersInboxComponent } from './app/employers-inbox/employers-inbox.component';
import { JobListingComponent } from './app/job-listing.component';
import { ProfileComponent } from './app/profile/profile.component';
import { MyJobsComponent } from './app/my-jobs/my-jobs.component';
import { MyApplicationsComponent } from './app/my-applications/my-applications.component';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div class="app-container" *ngIf="isLoggedIn">
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>Menu</h2>
        </div>
        <nav class="sidebar-nav">
          <!-- Job Seeker Menu -->
          <ng-container *ngIf="userType === 'jobseeker'">
            <a routerLink="/disabilities" 
               routerLinkActive="active" 
               class="nav-item">
              <span class="nav-icon">👥</span>
              <span class="nav-text">Discapacidades</span>
            </a>
            <a routerLink="/skills" 
               routerLinkActive="active" 
               class="nav-item">
              <span class="nav-icon">🎯</span>
              <span class="nav-text">Habilidades</span>
            </a>
            <a routerLink="/about-me" 
               routerLinkActive="active" 
               class="nav-item">
              <span class="nav-icon">👤</span>
              <span class="nav-text">Sobre Mi</span>
            </a>
            <a routerLink="/profile" 
               routerLinkActive="active" 
               class="nav-item">
              <span class="nav-icon">📋</span>
              <span class="nav-text">Tu Perfil</span>
            </a>
            <a routerLink="/job-recommendations" 
               routerLinkActive="active" 
               class="nav-item">
              <span class="nav-icon">💼</span>
              <span class="nav-text">Mis Empleos</span>
            </a>
            <a routerLink="/my-applications" 
               routerLinkActive="active" 
               class="nav-item">
              <span class="nav-icon">📝</span>
              <span class="nav-text">Mis Aplicaciones</span>
            </a>
            <a routerLink="/inbox" 
               routerLinkActive="active" 
               class="nav-item">
              <span class="nav-icon">✉️</span>
              <span class="nav-text">Inbox</span>
            </a>
          </ng-container>

          <!-- Employer Menu -->
          <ng-container *ngIf="userType === 'employer'">
            <a routerLink="/employers" 
               routerLinkActive="active" 
               class="nav-item">
              <span class="nav-icon">👥</span>
              <span class="nav-text">Buscar Candidatos</span>
            </a>
            <a routerLink="/job-listing" 
               routerLinkActive="active" 
               class="nav-item">
              <span class="nav-icon">📄</span>
              <span class="nav-text">Publicar Empleo</span>
            </a>
            <a routerLink="/my-jobs" 
               routerLinkActive="active" 
               class="nav-item">
              <span class="nav-icon">📋</span>
              <span class="nav-text">Mis Empleos</span>
            </a>
            <a routerLink="/employer-inbox" 
               routerLinkActive="active" 
               class="nav-item">
              <span class="nav-icon">✉️</span>
              <span class="nav-text">Inbox</span>
            </a>
          </ng-container>
        </nav>
      </aside>

      <main class="main-content">
        <header class="top-header">
          <h1>Bienvenido de nuevo!</h1>
          <div class="user-info">
            <span class="user-type-badge">{{ userType === 'employer' ? 'Employer' : 'Job Seeker' }}</span>
            <button (click)="logout()" class="logout-btn">Logout</button>
          </div>
        </header>
        
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>

    <router-outlet *ngIf="!isLoggedIn"></router-outlet>

    <!-- Registration Modal -->
    <div class="registration-modal" *ngIf="showRegistration">
      <div class="registration-box">
        <h2>Register New User</h2>
        <form (ngSubmit)="register()" #regForm="ngForm">
          <div class="form-group">
            <label>Username</label>
            <input type="text" [(ngModel)]="regUsername" name="regUsername" required class="form-control" placeholder="Enter username" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="regEmail" name="regEmail" required class="form-control" placeholder="Enter email" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="regPassword" name="regPassword" required class="form-control" placeholder="Enter password" />
          </div>
          <div class="form-group">
            <label>User Type</label>
            <select [(ngModel)]="regUserType" name="regUserType" required class="form-control">
              <option value="jobseeker">Job Seeker</option>
              <option value="employer">Employer</option>
            </select>
          </div>
          <div class="form-group">
            <label>First Name</label>
            <input type="text" [(ngModel)]="regFirstName" name="regFirstName" required class="form-control" placeholder="Enter first name" />
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input type="text" [(ngModel)]="regLastName" name="regLastName" required class="form-control" placeholder="Enter last name" />
          </div>
          <div class="form-actions">
            <button type="submit" class="register-btn">Register</button>
            <button type="button" class="cancel-btn" (click)="showRegistration = false">Cancel</button>
          </div>
          <div class="confirmation-message" *ngIf="registrationSuccess">Registration successful! You can now log in.</div>
          <div class="error-message" *ngIf="registrationError">{{ registrationError }}</div>
        </form>
      </div>
    </div>
    <button *ngIf="!isLoggedIn && !showRegistration" class="open-registration-btn" (click)="showRegistration = true">Register</button>
  `,
  imports: [RouterModule, CommonModule, FormsModule],
  styles: [`
    .app-container {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 250px;
      background-color: #2c3e50;
      color: white;
      padding: 1rem 0;
      box-shadow: 2px 0 5px rgba(0,0,0,0.1);
    }

    .sidebar-header {
      padding: 0 1.5rem;
      margin-bottom: 2rem;
    }

    .sidebar-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #ecf0f1;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 1rem 1.5rem;
      color: #ecf0f1;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .nav-item:hover {
      background-color: #34495e;
    }

    .nav-item.active {
      background-color: #3498db;
    }

    .nav-icon {
      margin-right: 1rem;
      font-size: 1.2rem;
    }

    .nav-text {
      font-size: 1rem;
    }

    .main-content {
      flex: 1;
      background-color: #f5f6fa;
      display: flex;
      flex-direction: column;
    }

    .top-header {
      background-color: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }

    .top-header h1 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.8rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-type-badge {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.3rem 0.8rem;
      border-radius: 16px;
      font-size: 0.9rem;
    }

    .content-area {
      flex: 1;
      padding: 2rem;
    }

    .logout-btn {
      padding: 0.5rem 1rem;
      background-color: #e74c3c;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .logout-btn:hover {
      background-color: #c0392b;
    }

    .registration-modal {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .registration-box {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      max-width: 400px;
      width: 100%;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-control {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      font-size: 1rem;
    }
    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }
    .register-btn {
      background: #2196f3;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 0.5rem 1.5rem;
      font-size: 1rem;
      cursor: pointer;
    }
    .register-btn:hover {
      background: #1976d2;
    }
    .cancel-btn {
      background: #e0e0e0;
      color: #333;
      border: none;
      border-radius: 6px;
      padding: 0.5rem 1.5rem;
      font-size: 1rem;
      cursor: pointer;
    }
    .open-registration-btn {
      position: fixed;
      top: 2rem;
      right: 2rem;
      background: #43a047;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 0.5rem 1.5rem;
      font-size: 1rem;
      cursor: pointer;
      z-index: 1001;
    }
    .open-registration-btn:hover {
      background: #388e3c;
    }
    .confirmation-message {
      color: #43a047;
      margin-top: 0.5rem;
      font-size: 1rem;
      font-weight: 500;
      animation: fadeIn 0.3s;
    }
    .error-message {
      color: #e53935;
      margin-top: 0.5rem;
      font-size: 1rem;
      font-weight: 500;
      animation: fadeIn 0.3s;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class App {
  name = 'Aplicación de Mariela';
  isLoggedIn: boolean = false;
  userType: 'jobseeker' | 'employer' = 'jobseeker';
  showRegistration = false;
  regUsername = '';
  regEmail = '';
  regPassword = '';
  regUserType: 'jobseeker' | 'employer' = 'jobseeker';
  regFirstName = '';
  regLastName = '';
  registrationSuccess = false;
  registrationError = '';

  constructor(private router: Router, private apiService: ApiService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.checkAuth();
      }
    });
  }

  ngOnInit() {
    this.checkAuth();
  }

  checkAuth() {
    this.isLoggedIn = this.apiService.isLoggedIn();
    this.userType = this.apiService.getUserType() || 'jobseeker';
    
    if (!this.isLoggedIn && this.router.url !== '/login') {
      this.router.navigate(['/login']);
    } else if (this.isLoggedIn) {
      // Allow employers to access /employers, /job-listing, /employer-inbox, and /my-jobs
      if (
        this.userType === 'employer' &&
        !(this.router.url.startsWith('/employers') || this.router.url.startsWith('/job-listing') || this.router.url.startsWith('/employer-inbox') || this.router.url.startsWith('/my-jobs'))
      ) {
        this.router.navigate(['/employers']);
      } else if (this.userType === 'jobseeker' && this.router.url === '/') {
        this.router.navigate(['/disabilities']);
      }
    }
  }

  logout() {
    this.apiService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }

  register() {
    this.registrationSuccess = false;
    this.registrationError = '';
    this.apiService.register(this.regUsername, this.regEmail, this.regPassword, this.regUserType, this.regFirstName, this.regLastName).subscribe({
      next: () => {
        this.registrationSuccess = true;
        this.regUsername = '';
        this.regEmail = '';
        this.regPassword = '';
        this.regUserType = 'jobseeker';
        this.regFirstName = '';
        this.regLastName = '';
        setTimeout(() => {
          this.showRegistration = false;
          this.registrationSuccess = false;
        }, 1200);
      },
      error: (error) => {
        this.registrationError = error.error?.error || 'Registration failed. Please try again.';
      }
    });
  }
}

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'disabilities', component: DisabilitiesComponent },
  { path: 'skills', component: SkillsComponent },
  { path: 'about-me', component: AboutMeComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'job-recommendations', component: JobRecommendationsComponent },
  { path: 'my-applications', component: MyApplicationsComponent },
  { path: 'employers', component: EmployersComponent },
  { path: 'saved-candidates', component: SavedCandidatesComponent },
  { path: 'inbox', component: InboxComponent },
  { path: 'employer-inbox', component: EmployersInboxComponent },
  { path: 'job-listing', component: JobListingComponent }, // Added job listing route
  { path: 'my-jobs', component: MyJobsComponent },
  { path: '', redirectTo: '/disabilities', pathMatch: 'full' },
];

bootstrapApplication(App, {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient()
  ],
});
