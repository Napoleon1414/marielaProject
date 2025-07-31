import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, JobSeekerProfile } from '../services/api.service';

@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="about-me-container">
      <div class="about-me-box">
        <h2>Sobre Mí</h2>
        <p class="subtitle">Cuéntanos sobre ti (máximo 250 palabras)</p>
        
        <div class="text-area-container">
          <textarea 
            [(ngModel)]="aboutMeText"
            placeholder="Escribe sobre ti aquí..."
            maxlength="1250"
            class="about-me-textarea">
          </textarea>
          <div class="word-counter" [class.near-limit]="wordCount >= 225">
            Palabras: {{ wordCount }}/250
          </div>
        </div>
        <button class="save-btn" (click)="saveProfile('about')">Guardar Sobre Mí</button>
        <div class="confirmation-message" *ngIf="showAboutMeConfirmation">
          ¡Sobre Mí guardado!
        </div>
      </div>

      <div class="special-needs-box">
        <h2>Necesidades Especiales</h2>
        <p class="subtitle">¿Qué necesidades especiales tienes?</p>
        
        <div class="text-area-container">
          <textarea 
            [(ngModel)]="specialNeedsText"
            class="special-needs-textarea">
          </textarea>
        </div>
        <button class="save-btn" (click)="saveProfile('special')">Guardar Necesidades Especiales</button>
        <div class="confirmation-message" *ngIf="showSpecialNeedsConfirmation">
          ¡Necesidades Especiales guardadas!
        </div>
      </div>
    </div>
  `,
  styles: [`
    .about-me-container {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .about-me-box, .special-needs-box {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      max-width: 800px;
      margin: 0 auto;
      width: 100%;
    }

    h2 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
      text-align: center;
    }

    .subtitle {
      color: #7f8c8d;
      text-align: center;
      margin-bottom: 2rem;
    }

    .text-area-container {
      position: relative;
      margin-bottom: 1rem;
    }

    .about-me-textarea, .special-needs-textarea {
      width: 100%;
      min-height: 200px;
      padding: 1rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      line-height: 1.5;
      resize: vertical;
      transition: border-color 0.3s ease;
    }

    .about-me-textarea:focus, .special-needs-textarea:focus {
      outline: none;
      border-color: #2196f3;
    }

    .word-counter {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      background: #f8f9fa;
      padding: 0.3rem 0.8rem;
      border-radius: 12px;
      font-size: 0.9rem;
      color: #6c757d;
    }

    .word-counter.near-limit {
      color: #f44336;
    }

    .saved-message {
      text-align: center;
      color: #4caf50;
      margin-top: 1rem;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .save-btn {
      margin-top: 1rem;
      padding: 0.5rem 1.5rem;
      background-color: #2196f3;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    .save-btn:hover {
      background-color: #1976d2;
    }
    .confirmation-message {
      color: #43a047;
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
export class AboutMeComponent implements OnInit {
  aboutMeText: string = '';
  specialNeedsText: string = '';
  wordCount: number = 0;
  isSaved: boolean = false;
  specialNeedsSaved: boolean = false;
  profileLoaded: boolean = false;
  showAboutMeConfirmation = false;
  showSpecialNeedsConfirmation = false;

  constructor(private apiService: ApiService) {}

  onTextChange() {
    this.wordCount = this.aboutMeText.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  saveProfile(type: 'about' | 'special') {
    if (!this.profileLoaded) return;
    this.apiService.getJobSeekerProfile().subscribe({
      next: (profile) => {
        const updatedProfile = {
          ...profile,
          about_me: this.aboutMeText,
          special_needs: this.specialNeedsText,
          first_name: profile?.first_name || 'User',
          last_name: profile?.last_name || 'Name'
        };
        this.apiService.saveJobSeekerProfile(updatedProfile).subscribe({
          next: () => {
            if (type === 'about') {
              this.showAboutMeConfirmation = true;
              setTimeout(() => this.showAboutMeConfirmation = false, 2000);
            } else {
              this.showSpecialNeedsConfirmation = true;
              setTimeout(() => this.showSpecialNeedsConfirmation = false, 2000);
            }
          },
          error: (error) => {
            console.error('Error saving profile:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error loading profile for save:', error);
      }
    });
  }

  ngOnInit() {
    this.apiService.getJobSeekerProfile().subscribe({
      next: (profile) => {
        this.aboutMeText = profile?.about_me || '';
        this.specialNeedsText = profile?.special_needs || '';
        this.wordCount = this.aboutMeText.trim().split(/\s+/).filter(word => word.length > 0).length;
        this.profileLoaded = true;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.profileLoaded = true;
      }
    });
  }
} 