import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-disabilities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="disabilities-container">
      <div class="disabilities-box">
        <h2>Información de Discapacidad</h2>
        <p class="info-text">Para poder aplicar a empleos, necesitas completar tu perfil. Por favor, selecciona tu tipo de discapacidad y guarda la información.</p>
        
        <div class="form-group">
          <label for="disabilityType">Selecciona el tipo de discapacidad</label>
          <select 
            id="disabilityType" 
            [(ngModel)]="selectedDisability" 
            (change)="onDisabilityChange()"
            class="form-control">
            <option value="">Elige una discapacidad...</option>
            <option *ngFor="let disability of disabilities" [value]="disability">
              {{ disability }}
            </option>
            <option value="custom">Otra (Especificar)</option>
          </select>
        </div>

        <div class="form-group" *ngIf="selectedDisability === 'custom'">
          <label for="customDisability">Especifica la discapacidad</label>
          <input 
            type="text" 
            id="customDisability" 
            [(ngModel)]="customDisability" 
            placeholder="Ingresa el nombre de la discapacidad"
            class="form-control">
        </div>

        <button class="save-btn" (click)="saveDisability()">Guardar Discapacidad</button>
        <div class="confirmation-message" *ngIf="showConfirmation">
          ¡Discapacidad guardada! Ahora puedes aplicar a empleos.
        </div>

        <div class="selected-info" *ngIf="selectedDisability && selectedDisability !== 'custom'">
          <h3>Discapacidad seleccionada: {{ selectedDisability }}</h3>
        </div>

        <div class="selected-info" *ngIf="selectedDisability === 'custom' && customDisability">
          <h3>Discapacidad personalizada: {{ customDisability }}</h3>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .disabilities-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: white;
      padding: 20px;
    }

    .disabilities-box {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 500px;
    }

    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 1.5rem;
    }

    .info-text {
      text-align: center;
      color: #666;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #666;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .form-control:focus {
      outline: none;
      border-color: #4CAF50;
    }

    .selected-info {
      margin-top: 1.5rem;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 4px;
      text-align: center;
    }

    .selected-info h3 {
      color: #333;
      margin: 0;
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
export class DisabilitiesComponent implements OnInit {
  disabilities: string[] = [
    'Síndrome de Down',
    'Trastorno del Espectro Autista',
    'Parálisis Cerebral',
    'Discapacidad Visual',
    'Discapacidad Auditiva',
    'Discapacidad Intelectual',
    'Discapacidad Física',
    'Trastorno del Habla y Lenguaje',
    'Dificultad de Aprendizaje',
    'Trastorno por Déficit de Atención e Hiperactividad (TDAH)'
  ];

  selectedDisability: string = '';
  customDisability: string = '';
  showConfirmation: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getJobSeekerProfile().subscribe({
      next: (profile) => {
        this.selectedDisability = profile?.disability_type || '';
        this.customDisability = profile?.custom_disability || '';
      },
      error: (error) => {
        console.error('Error loading profile:', error);
      }
    });
  }

  onDisabilityChange() {
    if (this.selectedDisability !== 'custom') {
      this.customDisability = '';
    }
  }

  saveDisability() {
    // Create a basic profile if it doesn't exist
    const basicProfile = {
      first_name: 'Usuario',
      last_name: 'Nuevo',
      about_me: '',
      special_needs: '',
      disability_type: this.selectedDisability,
      custom_disability: this.selectedDisability === 'custom' ? this.customDisability : ''
    };

    this.apiService.saveJobSeekerProfile(basicProfile).subscribe({
      next: () => {
        this.showConfirmation = true;
        setTimeout(() => this.showConfirmation = false, 2000);
        console.log('Profile saved successfully');
      },
      error: (error) => {
        console.error('Error saving profile:', error);
        alert('Error al guardar el perfil. Por favor, intenta de nuevo.');
      }
    });
  }
} 