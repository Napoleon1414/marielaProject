import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-job-listing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="job-listing-container">
      <h2>Publicar Nueva Oferta de Empleo</h2>
      <p class="subtitle">Completa el formulario para publicar una vacante.</p>
      
      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>
      
      <form (ngSubmit)="publicarEmpleo()" *ngIf="!publicado">
        <div class="form-group">
          <label for="titulo">Título del Puesto</label>
          <input id="titulo" [(ngModel)]="titulo" name="titulo" required class="form-control" />
        </div>
        <div class="form-group">
          <label for="descripcion">Descripción</label>
          <textarea id="descripcion" [(ngModel)]="descripcion" name="descripcion" required class="form-control"></textarea>
        </div>
        <div class="form-group">
          <label for="requisitos">Requisitos</label>
          <textarea id="requisitos" [(ngModel)]="requisitos" name="requisitos" required class="form-control"></textarea>
        </div>
        <div class="form-group">
          <label for="ubicacion">Ubicación</label>
          <input id="ubicacion" [(ngModel)]="ubicacion" name="ubicacion" required class="form-control" />
        </div>
        <div class="form-group">
          <label for="tipoContrato">Tipo de Contrato</label>
          <select id="tipoContrato" [(ngModel)]="tipoContrato" name="tipoContrato" required class="form-control">
            <option value="">Selecciona...</option>
            <option value="Tiempo Completo">Tiempo Completo</option>
            <option value="Tiempo Parcial">Tiempo Parcial</option>
            <option value="Temporal">Temporal</option>
            <option value="Prácticas">Prácticas</option>
            <option value="Remoto">Remoto</option>
          </select>
        </div>
        <div class="form-group">
          <label for="salario">Rango Salarial</label>
          <input id="salario" [(ngModel)]="salario" name="salario" required class="form-control" placeholder="Ej: $1,500 - $2,500 USD" />
        </div>
        <div class="form-group">
          <label for="estado">Estado del Empleo</label>
          <select id="estado" [(ngModel)]="estado" name="estado" required class="form-control">
            <option value="active">Activo</option>
            <option value="draft">Borrador</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="submit" class="submit-btn" [disabled]="loading">
            <span *ngIf="loading" class="spinner-small"></span>
            {{ loading ? 'Publicando...' : 'Publicar Empleo' }}
          </button>
          <button type="button" class="cancel-btn" (click)="cancelar()">Cancelar</button>
        </div>
      </form>
      <div *ngIf="publicado" class="confirmation-message">
        <h3>¡Empleo publicado exitosamente!</h3>
        <p>Tu vacante ha sido publicada y ahora es visible para los candidatos.</p>
        <div class="confirmation-actions">
          <button (click)="resetForm()" class="submit-btn">Publicar otro empleo</button>
          <button (click)="verMisEmpleos()" class="view-jobs-btn">Ver Mis Empleos</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.job-listing-container {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      max-width: 700px;
      margin: 2rem auto;
      text-align: center;
    }
    .subtitle {
      color: #7f8c8d;
      margin-bottom: 2rem;
    }
    form {
      text-align: left;
      margin: 0 auto;
      max-width: 500px;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 500;
    }
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    textarea.form-control {
      min-height: 80px;
      resize: vertical;
    }
    .submit-btn {
      background: #2196f3;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.75rem 2rem;
      font-size: 1.1rem;
      cursor: pointer;
      margin-top: 1rem;
      transition: background 0.3s;
    }
    .submit-btn:hover {
      background: #1976d2;
    }
    .submit-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }
    .cancel-btn {
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.75rem 2rem;
      font-size: 1.1rem;
      cursor: pointer;
      transition: background 0.3s;
    }
    .cancel-btn:hover {
      background: #5a6268;
    }
    .error-message {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      text-align: center;
    }
    .spinner-small {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #ffffff;
      border-top: 2px solid transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 0.5rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .confirmation-message {
      background: #e8f5e9;
      color: #2e7d32;
      border-radius: 8px;
      padding: 2rem;
      margin-top: 2rem;
    }
    .confirmation-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 1rem;
    }
    .view-jobs-btn {
      background: #28a745;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.75rem 2rem;
      font-size: 1.1rem;
      cursor: pointer;
      transition: background 0.3s;
    }
    .view-jobs-btn:hover {
      background: #218838;
    }
  `
  ]
})
export class JobListingComponent {
  titulo = '';
  descripcion = '';
  requisitos = '';
  ubicacion = '';
  tipoContrato = '';
  salario = '';
  estado = 'active';
  publicado = false;
  loading = false;
  error = '';

  constructor(private apiService: ApiService, private router: Router) {}

  publicarEmpleo() {
    if (!this.titulo || !this.descripcion || !this.requisitos || !this.ubicacion || !this.tipoContrato || !this.salario) {
      this.error = 'Por favor, completa todos los campos requeridos.';
      return;
    }

    this.loading = true;
    this.error = '';

    const jobData = {
      title: this.titulo,
      description: this.descripcion,
      requirements: this.requisitos,
      location: this.ubicacion,
      job_type: this.tipoContrato,
      salary_range: this.salario,
      status: this.estado as 'active' | 'closed' | 'draft'
    };

    this.apiService.createJobPosting(jobData).subscribe({
      next: (response) => {
        this.publicado = true;
        this.loading = false;
        console.log('Empleo creado exitosamente:', response);
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Error al publicar el empleo. Por favor, intenta de nuevo.';
        console.error('Error creating job posting:', error);
      }
    });
  }

  resetForm() {
    this.titulo = '';
    this.descripcion = '';
    this.requisitos = '';
    this.ubicacion = '';
    this.tipoContrato = '';
    this.salario = '';
    this.estado = 'active';
    this.publicado = false;
    this.error = '';
  }

  cancelar() {
    this.router.navigate(['/my-jobs']);
  }

  verMisEmpleos() {
    this.router.navigate(['/my-jobs']);
  }
}
