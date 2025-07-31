import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Skill } from '../services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="skills-container">
      <div class="skills-box">
        <h2>Evaluación de Habilidades Personales</h2>
        <p class="subtitle">Selecciona tus habilidades personales</p>
        
        <div class="skills-grid">
          <div *ngFor="let skill of skills" 
               class="skill-card"
               [class.selected]="selectedSkills.includes(skill.id)"
               (click)="toggleSkill(skill.id)">
            <div class="skill-name">{{ getSkillName(skill.id) }}</div>
          </div>
        </div>

        <div class="selected-skills" *ngIf="selectedSkills.length > 0">
          <h3>Tus Habilidades Seleccionadas:</h3>
          <div class="selected-skills-list">
            <span *ngFor="let skillId of selectedSkills" class="selected-skill-tag">
              {{ getSkillName(skillId) }}
              <button class="remove-skill" (click)="removeSkill(skillId)">×</button>
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .skills-container {
      padding: 20px;
    }

    .skills-box {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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

    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .skill-card {
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 0;
      width: 90px;
      height: 90px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 6px rgba(0,0,0,0.04);
      margin: 0 auto;
      font-size: 0.75rem;
      padding: 0;
    }
    .skill-card.selected {
      background: #e3f2fd;
      border-color: #2196f3;
    }
    .skill-icon {
      display: none;
    }
    .skill-name {
      font-size: 0.78rem;
      color: #2c3e50;
      font-weight: 500;
      text-align: center;
      line-height: 1.15;
      word-break: normal;
      white-space: normal;
      overflow-wrap: anywhere;
      max-width: 80px;
      max-height: 70px;
      display: block;
      margin: 0;
      padding: 0;
    }

    .selected-skills {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;
    }

    .selected-skills h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .selected-skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .selected-skill-tag {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.4rem 0.8rem;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
    }

    .remove-skill {
      background: none;
      border: none;
      color: #1976d2;
      cursor: pointer;
      font-size: 1.1rem;
      padding: 0 0.2rem;
      line-height: 1;
    }

    .remove-skill:hover {
      color: #f44336;
    }
  `]
})
export class SkillsComponent implements OnInit {
  skills: Skill[] = [];
  selectedSkills: number[] = [];
  showConfirmation: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadSkills();
  }

  private loadSkills() {
    this.apiService.getSkills().subscribe({
      next: (skills) => {
        this.skills = skills;
        this.loadSelectedSkills();
      },
      error: (error) => {
        console.error('Error loading skills:', error);
        this.skills = [];
      }
    });
  }

  private loadSelectedSkills() {
    this.apiService.getJobSeekerSkills().subscribe({
      next: (skills) => {
        this.selectedSkills = skills.map(skill => skill.id);
      },
      error: (error) => {
        console.error('Error loading selected skills:', error);
        this.selectedSkills = [];
      }
    });
  }

  toggleSkill(skillId: number) {
    const index = this.selectedSkills.indexOf(skillId);
    if (index === -1) {
      this.selectedSkills.push(skillId);
    } else {
      this.selectedSkills.splice(index, 1);
    }
    this.apiService.saveJobSeekerSkills(this.selectedSkills).subscribe({
      next: () => {
        this.loadSelectedSkills();
      },
      error: (error) => {
        console.error('Error saving skills:', error);
      }
    });
  }

  removeSkill(skillId: number) {
    const index = this.selectedSkills.indexOf(skillId);
    if (index !== -1) {
      this.selectedSkills.splice(index, 1);
      this.apiService.saveJobSeekerSkills(this.selectedSkills).subscribe({
        next: () => {
          this.loadSelectedSkills();
        },
        error: (error) => {
          console.error('Error updating skills:', error);
        }
      });
    }
  }

  saveSkills() {
    this.apiService.saveJobSeekerSkills(this.selectedSkills).subscribe({
      next: () => {
        this.showConfirmation = true;
        setTimeout(() => {
          this.showConfirmation = false;
        }, 3000); // Hide after 3 seconds
      },
      error: (error) => {
        console.error('Error saving skills:', error);
      }
    });
  }

  getSkillName(skillId: number): string {
    const skill = this.skills.find(s => s.id === skillId);
    return skill ? skill.name : '';
  }

  getSkillIcon(skill: string): string {
    const icons: { [key: string]: string } = {
      'Comunicación': '💬',
      'Resolución de Problemas': '🔧',
      'Trabajo en Equipo': '👥',
      'Liderazgo': '👑',
      'Creatividad': '🎨',
      'Adaptabilidad': '🔄',
      'Gestión del Tiempo': '⏰',
      'Pensamiento Crítico': '🧠',
      'Organización': '📁',
      'Habilidades Técnicas': '💻',
      'Inteligencia Emocional': '❤️',
      'Oratoria': '🎤',
      'Gestión de Proyectos': '📊',
      'Pensamiento Analítico': '📈',
      'Atención al Cliente': '🤝',
      'Investigación': '🔍',
      'Análisis de Datos': '📊',
      'Redacción': '✍️',
      'Negociación': '🤝',
      'Toma de Decisiones': '⚖️',
      'Resolución de Conflictos': '🤝',
      'Innovación': '💡',
      'Planificación Estratégica': '🗺️',
      'Gestión de Recursos': '📦',
      'Control de Calidad': '✅',
      'Gestión de Riesgos': '⚠️',
      'Presupuestación': '💰',
      'Capacitación': '🎓',
      'Mentoría': '🧑‍🏫',
      'Networking': '🌐',
      'Ventas': '💵',
      'Marketing': '📢',
      'Planificación de Eventos': '📅',
      'Documentación': '📄',
      'Multitarea': '🔀'
    };
    // Always use the Spanish name for icon lookup
    const translations: { [key: string]: string } = {
      'Communication': 'Comunicación',
      'Problem Solving': 'Resolución de Problemas',
      'Teamwork': 'Trabajo en Equipo',
      'Leadership': 'Liderazgo',
      'Creativity': 'Creatividad',
      'Adaptability': 'Adaptabilidad',
      'Time Management': 'Gestión del Tiempo',
      'Critical Thinking': 'Pensamiento Crítico',
      'Organization': 'Organización',
      'Technical Skills': 'Habilidades Técnicas',
      'Emotional Intelligence': 'Inteligencia Emocional',
      'Public Speaking': 'Oratoria',
      'Project Management': 'Gestión de Proyectos',
      'Analytical Thinking': 'Pensamiento Analítico',
      'Customer Service': 'Atención al Cliente',
      'Research': 'Investigación',
      'Data Analysis': 'Análisis de Datos',
      'Writing': 'Redacción',
      'Negotiation': 'Negociación',
      'Decision Making': 'Toma de Decisiones',
      'Conflict Resolution': 'Resolución de Conflictos',
      'Innovation': 'Innovación',
      'Strategic Planning': 'Planificación Estratégica',
      'Resource Management': 'Gestión de Recursos',
      'Quality Control': 'Control de Calidad',
      'Risk Management': 'Gestión de Riesgos',
      'Budgeting': 'Presupuestación',
      'Training': 'Capacitación',
      'Mentoring': 'Mentoría',
      'Networking': 'Networking',
      'Sales': 'Ventas',
      'Marketing': 'Marketing',
      'Event Planning': 'Planificación de Eventos',
      'Documentation': 'Documentación',
      'Multitasking': 'Multitarea'
    };
    const spanish = translations[skill] || skill;
    return icons[spanish] || '❓';
  }
} 