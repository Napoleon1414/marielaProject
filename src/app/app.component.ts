import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkillsComponent } from './skills/skills.component';
import { AboutMeComponent } from './about-me/about-me.component';
import { SavedCandidatesComponent } from './saved-candidates/saved-candidates.component';
import { JobListingComponent } from './job-listing.component';
import { ProfileComponent } from './profile/profile.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, SkillsComponent, AboutMeComponent, SavedCandidatesComponent, JobListingComponent, ProfileComponent],
  template: `
    <div class="app-container">
      <nav class="menu">
        <div class="menu-item" [class.active]="currentSection === 'disabilities'" (click)="currentSection = 'disabilities'">
          <span class="icon">👤‍🦽</span> Discapacidad
        </div>
        <div class="menu-item" [class.active]="currentSection === 'skills'" (click)="currentSection = 'skills'">
          <span class="icon">🎯</span> Habilidades
        </div>
        <div class="menu-item" [class.active]="currentSection === 'about-me'" (click)="currentSection = 'about-me'">
          <span class="icon">👤</span> Sobre Mí
        </div>
        <div class="menu-item" [class.active]="currentSection === 'profile'" (click)="currentSection = 'profile'">
          <span class="icon">📋</span> Tu Perfil
        </div>
        <div class="menu-item" [class.active]="currentSection === 'job-recommendations'" (click)="currentSection = 'job-recommendations'">
          <span class="icon">💼</span> Recomendaciones de Empleo
        </div>
        <div class="menu-item" [class.active]="currentSection === 'job-listing'" (click)="currentSection = 'job-listing'">
          <span class="icon">📄</span> Publicar Empleo
        </div>
        <div class="menu-item" [class.active]="currentSection === 'employers'" (click)="currentSection = 'employers'">
          <span class="icon">🔍</span> Ver Candidatos
        </div>
        <div class="menu-item" [class.active]="currentSection === 'inbox'" (click)="currentSection = 'inbox'">
          <span class="icon">📥</span> Bandeja de Entrada
        </div>
      </nav>

      <main class="content">
        <app-skills *ngIf="currentSection === 'skills'"></app-skills>
        <app-about-me *ngIf="currentSection === 'about-me'"></app-about-me>
        <app-profile *ngIf="currentSection === 'profile'"></app-profile>
        <app-saved-candidates *ngIf="currentSection === 'saved-candidates'"></app-saved-candidates>
        <app-job-listing *ngIf="currentSection === 'job-listing'"></app-job-listing>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .menu {
      background: white;
      padding: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      justify-content: center;
      gap: 2rem;
    }

    .menu-item {
      padding: 0.5rem 1rem;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.3s ease;
      color: #666;
    }

    .menu-item:hover {
      background: #f0f0f0;
    }

    .menu-item.active {
      background: #e3f2fd;
      color: #1976d2;
    }

    .content {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class AppComponent {
  currentSection: string = 'skills';
} 