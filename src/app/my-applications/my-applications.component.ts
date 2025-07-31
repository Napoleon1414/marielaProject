import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, JobApplication } from '../services/api.service';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="applications-container">
      <div class="applications-box">
        <h2>Mis Aplicaciones</h2>
        <p class="subtitle">Aquí puedes ver el estado de todas tus aplicaciones a empleos</p>

        <div class="loading-message" *ngIf="loading">
          <div class="spinner"></div>
          <p>Cargando aplicaciones...</p>
        </div>

        <div class="error-message" *ngIf="error && !loading">
          <p>{{ error }}</p>
          <button class="retry-btn" (click)="loadApplications()">Reintentar</button>
        </div>

        <div class="applications-list" *ngIf="!loading && !error && applications.length > 0">
          <div *ngFor="let application of applications" class="application-card">
            <div class="application-header">
              <h3>{{ application.job_title }}</h3>
              <div class="status-badge" [class]="getStatusClass(application.status)">
                {{ getStatusText(application.status) }}
              </div>
            </div>
            
            <div class="application-info">
              <div class="info-item">
                <span class="info-label">🏢 Empresa:</span>
                <span class="info-value">{{ application.company_name || 'No especificada' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">📍 Ubicación:</span>
                <span class="info-value">{{ application.location || 'No especificada' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">💰 Salario:</span>
                <span class="info-value">{{ application.salary_range || 'No especificado' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">⏰ Tipo de Empleo:</span>
                <span class="info-value">{{ application.job_type || 'No especificado' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">📅 Fecha de Aplicación:</span>
                <span class="info-value">{{ formatDate(application.applied_at) }}</span>
              </div>
            </div>
            
            <div class="cover-letter-section" *ngIf="application.cover_letter">
              <h4>Carta de Presentación</h4>
              <p class="cover-letter-text">{{ application.cover_letter }}</p>
            </div>
          </div>
        </div>

        <div class="no-applications" *ngIf="!loading && !error && applications.length === 0">
          <div class="no-apps-icon">📝</div>
          <h3>No tienes aplicaciones</h3>
          <p>Aún no has aplicado a ningún empleo. ¡Explora las oportunidades disponibles y envía tu primera aplicación!</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .applications-container {
      padding: 20px;
    }

    .applications-box {
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

    .application-card {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      transition: transform 0.3s ease;
      color: #111;
    }

    .application-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .application-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      color: #111;
    }

    .application-header h3 {
      color: #2c3e50;
      margin: 0;
    }

    .status-badge {
      padding: 0.3rem 0.8rem;
      border-radius: 16px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .status-badge.pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.reviewed {
      background: #d1ecf1;
      color: #0c5460;
    }

    .status-badge.accepted {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.rejected {
      background: #f8d7da;
      color: #721c24;
    }

    .application-info {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .info-label {
      font-weight: 600;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .info-value {
      color: #2c3e50;
      font-size: 1rem;
    }

    .cover-letter-section {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 6px;
      margin-top: 1rem;
    }

    .cover-letter-section h4 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .cover-letter-text {
      color: #111;
      line-height: 1.5;
      margin: 0;
    }

    .no-applications {
      text-align: center;
      color: #666;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .no-apps-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .no-applications h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .loading-message {
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-message {
      text-align: center;
      padding: 2rem;
      background: #ffebee;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      color: #c62828;
    }

    .retry-btn {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 1rem;
      transition: background 0.3s ease;
    }

    .retry-btn:hover {
      background: #c0392b;
    }
  `]
})
export class MyApplicationsComponent implements OnInit {
  applications: JobApplication[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.loading = true;
    this.error = null;
    
    this.apiService.getMyApplications().subscribe({
      next: (applications) => {
        console.log('Applications loaded:', applications);
        this.applications = applications;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading applications:', error);
        this.error = 'Error al cargar las aplicaciones. Por favor, intenta de nuevo.';
        this.applications = [];
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    return `status-badge ${status}`;
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pendiente',
      'reviewed': 'Revisada',
      'accepted': 'Aceptada',
      'rejected': 'Rechazada'
    };
    return statusMap[status] || status;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
} 