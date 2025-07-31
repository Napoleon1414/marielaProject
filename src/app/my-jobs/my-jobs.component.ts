import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ApiService, JobPosting, JobApplication } from '../services/api.service';

@Component({
  selector: 'app-my-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="my-jobs-container">
      <div class="my-jobs-header">
        <h2>Mis Empleos Publicados</h2>
        <p class="subtitle">Gestiona y revisa todos los empleos que has publicado</p>
      </div>

      <div class="jobs-stats">
        <div class="stat-card">
          <div class="stat-number">{{ activeJobs }}</div>
          <div class="stat-label">Empleos Activos</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ totalApplications }}</div>
          <div class="stat-label">Total de Aplicaciones</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ closedJobs }}</div>
          <div class="stat-label">Empleos Cerrados</div>
        </div>
      </div>

      <div class="jobs-filters">
        <button 
          *ngFor="let filter of filters" 
          [class.active]="activeFilter === filter.value"
          (click)="setFilter(filter.value)"
          class="filter-btn">
          {{ filter.label }}
        </button>
      </div>

      <div class="loading-message" *ngIf="loading">
        <div class="spinner"></div>
        <p>Cargando empleos...</p>
      </div>

      <div class="error-message" *ngIf="error && !loading">
        <p>{{ error }}</p>
        <button class="retry-btn" (click)="reloadJobs()">Reintentar</button>
      </div>

      <div class="jobs-list" *ngIf="!loading && !error && filteredJobs.length > 0; else noJobs">
        <div *ngFor="let job of filteredJobs" class="job-card">
          <div class="job-header">
            <div class="job-title-section">
              <h3>{{ job.title }}</h3>
              <span class="job-status" [class]="job.status">
                {{ getStatusText(job.status) }}
              </span>
            </div>
            <div class="job-actions">
              <button class="action-btn edit-btn" (click)="editJob(job)">
                ✏️ Editar
              </button>
              <button class="action-btn view-applications-btn" (click)="viewApplications(job)">
                👥 Ver Aplicaciones ({{ job.applications_count }})
              </button>
              <button 
                class="action-btn toggle-status-btn" 
                [class]="job.status === 'active' ? 'close-btn' : 'activate-btn'"
                (click)="toggleJobStatus(job)">
                {{ job.status === 'active' ? '🔒 Cerrar' : '🔓 Reabrir' }}
              </button>
            </div>
          </div>

          <div class="job-details">
            <div class="job-info">
              <div class="info-item">
                <span class="info-label">📍 Ubicación:</span>
                <span class="info-value">{{ job.location }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">💰 Salario:</span>
                <span class="info-value">{{ job.salary_range }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">⏰ Tipo de Empleo:</span>
                <span class="info-value">{{ job.job_type }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">📅 Publicado:</span>
                <span class="info-value">{{ formatDate(job.created_at) }}</span>
              </div>
            </div>

            <div class="job-description">
              <h4>Descripción</h4>
              <p>{{ job.description }}</p>
            </div>

            <div class="job-requirements">
              <h4>Requisitos</h4>
              <p>{{ job.requirements }}</p>
            </div>
          </div>
        </div>
      </div>

      <ng-template #noJobs>
        <div class="no-jobs">
          <div class="no-jobs-icon">📋</div>
          <h3>No hay empleos publicados</h3>
          <p>Comienza publicando tu primer empleo para encontrar candidatos talentosos.</p>
          <button class="create-job-btn" (click)="createNewJob()">
            ➕ Publicar Nuevo Empleo
          </button>
        </div>
      </ng-template>
    </div>

    <!-- Applications Modal -->
    <div class="modal-overlay" *ngIf="showApplicationsModal" (click)="closeApplicationsModal()">
      <div class="modal-content applications-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Aplicaciones para: {{ selectedJob?.title }}</h3>
          <button class="close-btn" (click)="closeApplicationsModal()">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="loading-message" *ngIf="loadingApplications">
            <div class="spinner"></div>
            <p>Cargando aplicaciones...</p>
          </div>

          <div class="error-message" *ngIf="applicationsError && !loadingApplications">
            <p>{{ applicationsError }}</p>
            <button class="retry-btn" (click)="loadApplications()">Reintentar</button>
          </div>

          <div class="applications-list" *ngIf="!loadingApplications && !applicationsError && applications.length > 0">
            <div *ngFor="let application of applications" class="application-card">
              <div class="application-header">
                <div class="applicant-info">
                  <h4>{{ application.job_seeker_name }}</h4>
                  <span class="application-status" [class]="application.status">
                    {{ getApplicationStatusText(application.status) }}
                  </span>
                </div>
                <div class="application-actions">
                  <button class="action-btn view-profile-btn" (click)="viewApplicantProfile(application)">
                    👤 Ver Perfil
                  </button>
                  <button class="action-btn message-btn" (click)="openMessageModal(application)">
                    💬 Enviar Mensaje
                  </button>
                  <select 
                    class="status-select" 
                    [value]="application.status"
                    (change)="updateApplicationStatus(application, $event)">
                    <option value="pending">Pendiente</option>
                    <option value="reviewed">Revisada</option>
                    <option value="accepted">Aceptada</option>
                    <option value="rejected">Rechazada</option>
                  </select>
                </div>
              </div>
              
              <div class="application-details">
                <div class="application-info">
                  <div class="info-item">
                    <span class="info-label">📅 Aplicó:</span>
                    <span class="info-value">{{ formatDate(application.applied_at) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">📧 Email:</span>
                    <span class="info-value">{{ application.email }}</span>
                  </div>
                </div>
                
                <div class="cover-letter-section" *ngIf="application.cover_letter">
                  <h5>Carta de Presentación</h5>
                  <p class="cover-letter-text">{{ application.cover_letter }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="no-applications" *ngIf="!loadingApplications && !applicationsError && applications.length === 0">
            <div class="no-apps-icon">📝</div>
            <h4>No hay aplicaciones</h4>
            <p>Aún no has recibido aplicaciones para este empleo.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Applicant Profile Modal -->
    <div class="modal-overlay" *ngIf="showProfileModal" (click)="closeProfileModal()">
      <div class="modal-content profile-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Perfil de {{ selectedApplicant?.first_name }} {{ selectedApplicant?.last_name }}</h3>
          <button class="close-btn" (click)="closeProfileModal()">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="loading-message" *ngIf="loadingProfile">
            <div class="spinner"></div>
            <p>Cargando perfil...</p>
          </div>

          <div class="profile-content" *ngIf="!loadingProfile && selectedApplicant">
            <div class="profile-section">
              <h4>Información Personal</h4>
              <div class="profile-info">
                <div class="info-item">
                  <span class="info-label">Nombre:</span>
                  <span class="info-value">{{ selectedApplicant.first_name }} {{ selectedApplicant.last_name }}</span>
                </div>
                <div class="info-item" *ngIf="selectedApplicant.about_me">
                  <span class="info-label">Sobre mí:</span>
                  <span class="info-value">{{ selectedApplicant.about_me }}</span>
                </div>
                <div class="info-item" *ngIf="selectedApplicant.special_needs">
                  <span class="info-label">Necesidades especiales:</span>
                  <span class="info-value">{{ selectedApplicant.special_needs }}</span>
                </div>
                <div class="info-item" *ngIf="selectedApplicant.disability_type">
                  <span class="info-label">Tipo de discapacidad:</span>
                  <span class="info-value">{{ selectedApplicant.disability_type }}</span>
                </div>
              </div>
            </div>

            <div class="profile-section" *ngIf="selectedApplicantSkills.length > 0">
              <h4>Habilidades</h4>
              <div class="skills-list">
                <span *ngFor="let skill of selectedApplicantSkills" class="skill-tag">
                  {{ skill.name }}
                </span>
              </div>
            </div>

            <div class="profile-actions">
              <button class="action-btn message-btn" (click)="openMessageModalFromProfile()">
                💬 Enviar Mensaje
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Modal -->
    <div class="modal-overlay" *ngIf="showMessageModal" (click)="closeMessageModal()">
      <div class="modal-content message-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Enviar Mensaje a {{ messageRecipient?.first_name }} {{ messageRecipient?.last_name }}</h3>
          <button class="close-btn" (click)="closeMessageModal()">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="messageContent">Mensaje</label>
            <textarea 
              id="messageContent"
              [(ngModel)]="messageContent" 
              class="form-control"
              rows="6"
              placeholder="Escribe tu mensaje aquí..."></textarea>
          </div>
          
          <div class="modal-actions">
            <button class="cancel-btn" (click)="closeMessageModal()" [disabled]="sendingMessage">
              Cancelar
            </button>
            <button class="submit-btn" (click)="sendMessage()" [disabled]="sendingMessage || !messageContent.trim()">
              <span *ngIf="sendingMessage">Enviando...</span>
              <span *ngIf="!sendingMessage">Enviar Mensaje</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-jobs-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .my-jobs-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .my-jobs-header h2 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }

    .subtitle {
      color: #7f8c8d;
      font-size: 1.1rem;
    }

    .jobs-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      text-align: center;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #3498db;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .jobs-filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 0.5rem 1rem;
      border: 2px solid #e9ecef;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }

    .filter-btn:hover {
      border-color: #3498db;
      color: #3498db;
    }

    .filter-btn.active {
      background: #3498db;
      color: white;
      border-color: #3498db;
    }

    .jobs-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .job-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .job-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }

    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .job-title-section {
      flex: 1;
    }

    .job-title-section h3 {
      color: #2c3e50;
      margin: 0 0 0.5rem 0;
      font-size: 1.3rem;
    }

    .job-status {
      padding: 0.3rem 0.8rem;
      border-radius: 16px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .job-status.active {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .job-status.closed {
      background: #ffebee;
      color: #c62828;
    }

    .job-status.draft {
      background: #fff3e0;
      color: #ef6c00;
    }

    .job-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .action-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.3s ease;
    }

    .edit-btn {
      background: #f39c12;
      color: white;
    }

    .edit-btn:hover {
      background: #e67e22;
    }

    .view-applications-btn {
      background: #3498db;
      color: white;
    }

    .view-applications-btn:hover {
      background: #2980b9;
    }

    .close-btn {
      background: #e74c3c;
      color: white;
    }

    .close-btn:hover {
      background: #c0392b;
    }

    .activate-btn {
      background: #27ae60;
      color: white;
    }

    .activate-btn:hover {
      background: #229954;
    }

    .job-details {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 2rem;
    }

    .job-info {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
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

    .job-description, .job-requirements {
      margin-bottom: 1.5rem;
    }

    .job-description h4, .job-requirements h4 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-size: 1.1rem;
    }

    .job-description p, .job-requirements p {
      color: #555;
      line-height: 1.6;
    }

    .no-jobs {
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .no-jobs-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .no-jobs h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .no-jobs p {
      color: #7f8c8d;
      margin-bottom: 2rem;
    }

    .create-job-btn {
      background: #3498db;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .create-job-btn:hover {
      background: #2980b9;
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

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 800px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .applications-modal {
      max-width: 1000px;
    }

    .profile-modal {
      max-width: 700px;
    }

    .message-modal {
      max-width: 600px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e9ecef;
    }

    .modal-header h3 {
      margin: 0;
      color: #2c3e50;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #7f8c8d;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      color: #e74c3c;
    }

    .modal-body {
      padding: 1.5rem;
    }

    /* Applications List Styles */
    .applications-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .application-card {
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
      background: #f8f9fa;
    }

    .application-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .applicant-info h4 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
    }

    .application-status {
      padding: 0.3rem 0.8rem;
      border-radius: 16px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .application-status.pending {
      background: #fff3cd;
      color: #856404;
    }

    .application-status.reviewed {
      background: #d1ecf1;
      color: #0c5460;
    }

    .application-status.accepted {
      background: #d4edda;
      color: #155724;
    }

    .application-status.rejected {
      background: #f8d7da;
      color: #721c24;
    }

    .application-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .action-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background 0.3s ease;
    }

    .view-profile-btn {
      background: #3498db;
      color: white;
    }

    .view-profile-btn:hover {
      background: #2980b9;
    }

    .message-btn {
      background: #27ae60;
      color: white;
    }

    .message-btn:hover {
      background: #229954;
    }

    .status-select {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.9rem;
    }

    .application-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .application-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .cover-letter-section {
      grid-column: 1 / -1;
    }

    .cover-letter-section h5 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
    }

    .cover-letter-text {
      background: white;
      padding: 1rem;
      border-radius: 6px;
      border: 1px solid #e9ecef;
      line-height: 1.5;
      margin: 0;
    }

    .no-applications {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .no-apps-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    /* Profile Modal Styles */
    .profile-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .profile-section {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
    }

    .profile-section h4 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
    }

    .profile-info {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .skill-tag {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.3rem 0.8rem;
      border-radius: 16px;
      font-size: 0.9rem;
    }

    .profile-actions {
      display: flex;
      justify-content: center;
      margin-top: 1rem;
    }

    /* Message Modal Styles */
    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      font-family: inherit;
      resize: vertical;
    }

    .form-control:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    .cancel-btn {
      background: #95a5a6;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.3s ease;
    }

    .cancel-btn:hover:not(:disabled) {
      background: #7f8c8d;
    }

    .submit-btn {
      background: #27ae60;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.3s ease;
    }

    .submit-btn:hover:not(:disabled) {
      background: #229954;
    }

    .cancel-btn:disabled,
    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class MyJobsComponent implements OnInit {
  jobs: JobPosting[] = [];
  filteredJobs: JobPosting[] = [];
  activeFilter: string = 'all';
  loading: boolean = false;
  error: string | null = null;
  
  // Applications modal properties
  showApplicationsModal: boolean = false;
  selectedJob: JobPosting | null = null;
  applications: JobApplication[] = [];
  loadingApplications: boolean = false;
  applicationsError: string | null = null;
  
  // Profile modal properties
  showProfileModal: boolean = false;
  selectedApplicant: any = null;
  selectedApplicantSkills: any[] = [];
  loadingProfile: boolean = false;
  
  // Message modal properties
  showMessageModal: boolean = false;
  messageRecipient: any = null;
  messageSubject: string = '';
  messageContent: string = '';
  sendingMessage: boolean = false;

  filters = [
    { label: 'Todos', value: 'all' },
    { label: 'Activos', value: 'active' },
    { label: 'Cerrados', value: 'closed' },
    { label: 'Borradores', value: 'draft' }
  ];

  get activeJobs(): number {
    return this.jobs.filter(job => job.status === 'active').length;
  }

  get closedJobs(): number {
    return this.jobs.filter(job => job.status === 'closed').length;
  }

  get totalApplications(): number {
    return this.jobs.reduce((total, job) => total + job.applications_count, 0);
  }

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.loadJobs();
    
    // Listen for navigation events to reload jobs when returning from job creation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Reload jobs when navigating to this page
      if (event.url === '/my-jobs') {
        this.loadJobs();
      }
    });
  }

  private loadJobs() {
    this.loading = true;
    this.error = null;
    
    this.apiService.getMyJobPostings().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
        this.applyFilter();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading job postings:', error);
        this.error = 'Error al cargar los empleos. Por favor, intenta de nuevo.';
        this.jobs = [];
        this.applyFilter();
        this.loading = false;
      }
    });
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.applyFilter();
  }

  private applyFilter() {
    if (this.activeFilter === 'all') {
      this.filteredJobs = this.jobs;
    } else {
      this.filteredJobs = this.jobs.filter(job => job.status === this.activeFilter);
    }
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'Activo',
      'closed': 'Cerrado',
      'draft': 'Borrador'
    };
    return statusMap[status] || status;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  editJob(job: JobPosting) {
    // Navigate to job editing page
    console.log('Edit job:', job.id);
    // In a real app, this would navigate to the job editing form
    // For now, we'll just show an alert
    alert(`Funcionalidad de edición para el empleo: ${job.title}`);
  }

  viewApplications(job: JobPosting) {
    this.selectedJob = job;
    this.showApplicationsModal = true;
    this.loadApplications();
  }

     loadApplications() {
    this.loadingApplications = true;
    this.applicationsError = null;
    this.applications = []; // Clear previous applications

    this.apiService.getJobApplications(this.selectedJob!.id).subscribe({
      next: (applications) => {
        this.applications = applications;
        this.loadingApplications = false;
      },
      error: (error) => {
        console.error('Error loading applications:', error);
        this.applicationsError = 'Error al cargar las aplicaciones. Por favor, intenta de nuevo.';
        this.loadingApplications = false;
      }
    });
  }

  getApplicationStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pendiente',
      'reviewed': 'Revisada',
      'accepted': 'Aceptada',
      'rejected': 'Rechazada'
    };
    return statusMap[status] || status;
  }

     viewApplicantProfile(application: JobApplication) {
     this.selectedApplicant = application.job_seeker;
     this.showProfileModal = true;
     this.loadApplicantProfile(application.job_seeker_id);
   }

   private loadApplicantProfile(jobSeekerId: number) {
     this.loadingProfile = true;
     this.selectedApplicantSkills = [];

     this.apiService.getJobSeekerProfileById(jobSeekerId).subscribe({
       next: (profile) => {
         this.selectedApplicant = profile;
         this.loadApplicantSkills(jobSeekerId);
         this.loadingProfile = false;
       },
       error: (error) => {
         console.error('Error loading applicant profile:', error);
         this.loadingProfile = false;
       }
     });
   }

   private loadApplicantSkills(jobSeekerId: number) {
     this.apiService.getJobSeekerSkillsById(jobSeekerId).subscribe({
       next: (skills) => {
         this.selectedApplicantSkills = skills;
       },
       error: (error) => {
         console.error('Error loading applicant skills:', error);
       }
     });
   }

  openMessageModal(application: JobApplication) {
    this.apiService.getJobSeekerProfileById(application.job_seeker_id).subscribe({
      next: (profile) => {
        this.messageRecipient = profile;
        this.messageSubject = '';
        this.messageContent = '';
        this.showMessageModal = true;
      },
      error: (error) => {
        console.error('Error loading job seeker profile:', error);
        alert('Error al cargar el perfil del candidato');
      }
    });
  }

  openMessageModalFromProfile() {
    this.messageRecipient = this.selectedApplicant;
    this.messageSubject = '';
    this.messageContent = '';
    this.showMessageModal = true;
  }

  closeApplicationsModal() {
    this.showApplicationsModal = false;
    this.selectedJob = null;
    this.applications = [];
    this.loadingApplications = false;
    this.applicationsError = null;
  }

  closeProfileModal() {
    this.showProfileModal = false;
    this.selectedApplicant = null;
    this.loadingProfile = false;
    this.selectedApplicantSkills = [];
  }

  closeMessageModal() {
    this.showMessageModal = false;
    this.messageRecipient = null;
    this.messageSubject = '';
    this.messageContent = '';
    this.sendingMessage = false;
  }

  sendMessage() {
    this.sendingMessage = true;
    this.apiService.sendMessage(this.messageRecipient!.id, this.messageContent, this.messageSubject).subscribe({
      next: (response) => {
        console.log('Message sent successfully:', response);
        alert('Mensaje enviado con éxito!');
        this.closeMessageModal();
      },
      error: (error) => {
        console.error('Error sending message:', error);
        alert('Error al enviar el mensaje. Por favor, intenta de nuevo.');
        this.sendingMessage = false;
      }
    });
  }

     updateApplicationStatus(application: JobApplication, event: Event) {
     const newStatus = (event.target as HTMLSelectElement).value as 'pending' | 'reviewed' | 'accepted' | 'rejected';
     this.apiService.updateJobApplicationStatus(application.id, newStatus).subscribe({
      next: (updatedApplication) => {
        // Update the application in the local array
        const index = this.applications.findIndex(app => app.id === application.id);
        if (index !== -1) {
          this.applications[index] = updatedApplication;
        }
        console.log(`Application ${application.id} status changed to ${newStatus}`);
      },
      error: (error) => {
        console.error('Error updating application status:', error);
        alert('Error al actualizar el estado de la aplicación');
      }
    });
  }

  toggleJobStatus(job: JobPosting) {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    
    this.apiService.toggleJobStatus(job.id, newStatus).subscribe({
      next: (updatedJob) => {
        // Update the job in the local array
        const index = this.jobs.findIndex(j => j.id === job.id);
        if (index !== -1) {
          this.jobs[index] = updatedJob;
          this.applyFilter();
        }
        console.log(`Job ${job.id} status changed to ${newStatus}`);
      },
      error: (error) => {
        console.error('Error updating job status:', error);
        alert('Error al actualizar el estado del empleo');
      }
    });
  }

  createNewJob() {
    // Navigate to job creation form
    console.log('Create new job');
    // Navigate to the job listing page
    this.router.navigate(['/job-listing']);
  }

  // Method to reload jobs data
  reloadJobs() {
    this.loadJobs();
  }
} 