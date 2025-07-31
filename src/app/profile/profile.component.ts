import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-container">
      <div class="profile-box">
        <h2>Tu Perfil</h2>
        <p class="subtitle">Información personal y profesional</p>

        <div class="profile-summary" *ngIf="userProfile">
          <div class="profile-section">
            <h4>Sobre Mí</h4>
            <p class="about-me-text">{{ userProfile.aboutMe || 'No especificado' }}</p>
          </div>
          <div class="profile-section">
            <h4>Discapacidad</h4>
            <p class="disability-text">
              {{ userProfile.disabilityType || userProfile.customDisability || 'No especificado' }}
            </p>
          </div>
          <div class="profile-section">
            <h4>Necesidades Especiales</h4>
            <p class="special-needs-text">{{ userProfile.specialNeeds || 'No especificado' }}</p>
          </div>
          <div class="profile-section">
            <h4>Habilidades</h4>
            <div class="skill-tags">
              <ng-container *ngIf="userProfile.skills && userProfile.skills.length > 0; else noSkills">
                <span *ngFor="let skillId of userProfile.skills" class="skill-tag">
                  {{ getSkillName(skillId) }}
                </span>
              </ng-container>
              <ng-template #noSkills>
                <span class="no-data">No se especificaron habilidades</span>
              </ng-template>
            </div>
          </div>
        </div>

        <div class="no-profile" *ngIf="!userProfile">
          <p>No se encontró información del perfil. Por favor completa las secciones de Habilidades y Sobre Mí.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 20px;
    }

    .profile-box {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      max-width: 800px;
      margin: 0 auto;
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

    .profile-summary {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1.5rem;
      color: #111;
    }

    .profile-section {
      margin-bottom: 1.5rem;
    }

    .profile-section:last-child {
      margin-bottom: 0;
    }

    .profile-section h4 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-size: 1.1rem;
    }

    .skill-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .skill-tag {
      background: #e3f2fd;
      color: #111;
      padding: 0.3rem 0.8rem;
      border-radius: 16px;
      font-size: 0.85rem;
    }

    .no-data {
      color: #888;
      font-style: italic;
    }

    .about-me-text {
      color: #111;
      line-height: 1.5;
    }

    .special-needs-text {
      color: #111;
      line-height: 1.5;
    }

    .disability-text {
      color: #111;
      line-height: 1.5;
    }

    .no-profile {
      text-align: center;
      color: #666;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
    }
  `]
})
export class ProfileComponent implements OnInit {
  userProfile: {
    skills: number[];
    specialNeeds: string;
    aboutMe: string;
    disabilityType?: string;
    customDisability?: string;
  } | null = null;

  allSkills: { id: number, name: string }[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadSkills();
    this.loadUserProfile();
  }

  private loadSkills() {
    this.apiService.getSkills().subscribe({
      next: (skills) => {
        this.allSkills = skills;
      },
      error: (error) => {
        console.error('Error loading skills:', error);
      }
    });
  }

  private loadUserProfile() {
    // Load job seeker profile (includes about me and disabilities)
    this.apiService.getJobSeekerProfile().subscribe({
      next: (profile: any) => {
        if (!this.userProfile) {
          this.userProfile = {
            skills: [],
            specialNeeds: '',
            aboutMe: ''
          };
        }
        this.userProfile.aboutMe = profile.about_me || '';
        this.userProfile.disabilityType = profile.disability_type;
        this.userProfile.customDisability = profile.custom_disability;
        this.userProfile.specialNeeds = profile.special_needs || '';
      },
      error: (error: any) => {
        console.error('Error loading job seeker profile:', error);
      }
    });

    // Load skills
    this.apiService.getJobSeekerSkills().subscribe({
      next: (skills: any) => {
        if (!this.userProfile) {
          this.userProfile = {
            skills: [],
            specialNeeds: '',
            aboutMe: ''
          };
        }
        this.userProfile.skills = skills.map((skill: any) => skill.id);
      },
      error: (error: any) => {
        console.error('Error loading user skills:', error);
      }
    });
  }

  getSkillName(skillId: number): string {
    const skill = this.allSkills.find(s => s.id === skillId);
    return skill ? skill.name : 'Habilidad desconocida';
  }

  public reloadUserProfile() {
    this.loadUserProfile();
  }
} 