import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, JobRecommendation, JobPosting } from '../services/api.service';

@Component({
  selector: 'app-job-recommendations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="job-recommendations-container">
      <div class="job-recommendations-box">
        <h2>Recomendaciones de Empleo</h2>
        <p class="subtitle">Basado en tu perfil, aquí hay algunas oportunidades de trabajo adecuadas</p>

        <!-- Debug info -->
        <div style="background: yellow; padding: 10px; margin: 10px;">
          <p>DEBUG: showApplyModal = {{ showApplyModal }}</p>
          <p>DEBUG: selectedJob = {{ selectedJob?.title || 'null' }}</p>
        </div>

        <!-- Debug button -->
        <button (click)="testModal()" style="background: red; color: white; padding: 10px; margin: 10px;">
          TEST MODAL
        </button>

        <div class="loading-message" *ngIf="loading">
          <div class="spinner"></div>
          <p>Cargando empleos...</p>
        </div>

        <div class="error-message" *ngIf="error && !loading">
          <p>{{ error }}</p>
          <button class="retry-btn" (click)="loadJobRecommendations()">Reintentar</button>
        </div>

        <div class="recommendations-list" *ngIf="!loading && !error && jobRecommendations.length > 0">
          <div *ngFor="let job of jobRecommendations" class="job-card">
            <div class="job-header">
              <h3>{{ job.title }}</h3>
              <div class="match-score" [class.high-match]="job.matchScore >= 80">
                {{ job.matchScore }}% Coincidencia
              </div>
            </div>
            
            <p class="job-description">{{ job.description }}</p>
            
            <div class="job-info">
              <div class="info-item">
                <span class="info-label">📍 Ubicación:</span>
                <span class="info-value">{{ job.location || 'No especificada' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">💰 Salario:</span>
                <span class="info-value">{{ job.salary_range || 'No especificado' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">⏰ Tipo de Empleo:</span>
                <span class="info-value">{{ job.job_type || 'No especificado' }}</span>
              </div>
            </div>
            
            <div class="job-details">
              <div class="skills-section">
                <h4>Habilidades Relevantes</h4>
                <div class="skill-tags">
                  <span *ngFor="let skill of job.skills" class="skill-tag">
                    {{ skill }}
                  </span>
                </div>
              </div>
              
              <div class="why-good-section">
                <h4>¿Por qué este trabajo podría ser bueno para ti?</h4>
                <ul>
                  <li *ngFor="let reason of job.whyGood">{{ reason }}</li>
                </ul>
              </div>
            </div>
            
            <div class="job-actions">
              <button class="apply-btn" (click)="openApplyModal(job)" [disabled]="applying">
                📝 Aplicar al Empleo
              </button>
            </div>
          </div>
        </div>

        <div class="no-recommendations" *ngIf="!loading && !error && jobRecommendations.length === 0">
          <div class="no-jobs-icon">💼</div>
          <h3>No hay empleos disponibles</h3>
          <p>Actualmente no hay empleos activos publicados. Vuelve más tarde para ver nuevas oportunidades.</p>
        </div>
      </div>
    </div>

    <!-- Application Modal - Moved outside main container -->
    <div class="modal-overlay" *ngIf="showApplyModal" (click)="closeApplyModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>TEST MODAL - Aplicar a: {{ selectedJob?.title }}</h3>
          <button class="close-btn" (click)="closeApplyModal()">&times;</button>
        </div>
        
        <div class="modal-body">
          <p>Modal is working!</p>
          <button (click)="closeApplyModal()">Close Modal</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .job-recommendations-container {
      padding: 20px;
    }

    .job-recommendations-box {
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

    .job-card {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      transition: transform 0.3s ease;
      color: #111;
    }

    .job-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      color: #111;
    }

    .job-header h3 {
      color: #2c3e50;
      margin: 0;
    }

    .match-score {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.3rem 0.8rem;
      border-radius: 16px;
      font-size: 0.9rem;
    }

    .match-score.high-match {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .job-description {
      color: #111;
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .job-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      color: #111;
    }

    .skills-section, .why-good-section {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 6px;
      color: #111;
    }

    .why-good-section ul {
      margin: 0;
      padding-left: 1.2rem;
    }

    .why-good-section li {
      color: #111;
      margin-bottom: 0.5rem;
    }

    .job-info {
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

    .job-actions {
      display: flex;
      justify-content: center;
      margin-top: 1.5rem;
    }

    .apply-btn {
      background: #27ae60;
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .apply-btn:hover {
      background: #229954;
    }

    .no-recommendations {
      text-align: center;
      color: #666;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .no-jobs-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .no-recommendations h3 {
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
      z-index: 9999;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      border: 3px solid red; /* Debug border */
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
export class JobRecommendationsComponent implements OnInit {
  jobRecommendations: JobRecommendation[] = [];
  loading: boolean = false;
  error: string | null = null;
  showApplyModal: boolean = false;
  selectedJob: JobRecommendation | null = null;
  coverLetter: string = '';
  applying: boolean = false;

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    console.log('JobRecommendationsComponent initialized');
    console.log('Initial showApplyModal:', this.showApplyModal);
    this.loadJobRecommendations();
  }

  loadJobRecommendations() {
    this.loading = true;
    this.error = null;
    
    this.apiService.getActiveJobPostings().subscribe({
      next: (jobPostings) => {
        console.log('Job postings loaded:', jobPostings);
        // Transform job postings to recommendations format
        this.jobRecommendations = jobPostings.map(job => ({
          id: job.id,
          title: job.title,
          description: job.description,
          matchScore: this.calculateMatchScore(job),
          skills: this.parseSkills(job.requirements),
          whyGood: this.generateWhyGoodReasons(job),
          location: job.location,
          salary_range: job.salary_range,
          job_type: job.job_type,
          employer_id: job.employer_id
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading job postings:', error);
        this.error = 'Error al cargar los empleos. Por favor, intenta de nuevo.';
        this.jobRecommendations = [];
        this.loading = false;
      }
    });
  }

  private calculateMatchScore(job: JobPosting): number {
    // Simple match score calculation based on job requirements
    // In a real app, this would compare with user's skills
    const baseScore = 70;
    const randomBonus = Math.floor(Math.random() * 30);
    return Math.min(100, baseScore + randomBonus);
  }

  private parseSkills(requirements: string): string[] {
    // Extract skills from requirements text
    // This is a simple implementation - in a real app, you'd have structured skills
    const commonSkills = [
      'Comunicación', 'Organización', 'Trabajo en Equipo', 'Resolución de Problemas',
      'Atención al Cliente', 'Gestión del Tiempo', 'Creatividad', 'Análisis de Datos'
    ];
    
    const foundSkills = commonSkills.filter(skill => 
      requirements.toLowerCase().includes(skill.toLowerCase())
    );
    
    return foundSkills.length > 0 ? foundSkills : ['Habilidades Generales'];
  }

  private generateWhyGoodReasons(job: JobPosting): string[] {
    const reasons = [];
    
    if (job.job_type.toLowerCase().includes('remoto') || job.job_type.toLowerCase().includes('remote')) {
      reasons.push('Trabajo remoto disponible');
    }
    
    if (job.job_type.toLowerCase().includes('flexible') || job.job_type.toLowerCase().includes('part-time')) {
      reasons.push('Horarios flexibles');
    }
    
    if (job.location.toLowerCase().includes('remoto') || job.location.toLowerCase().includes('remote')) {
      reasons.push('Ubicación remota');
    }
    
    if (reasons.length === 0) {
      reasons.push('Oportunidad de crecimiento profesional');
      reasons.push('Entorno de trabajo colaborativo');
    }
    
    return reasons;
  }

  openApplyModal(job: JobRecommendation) {
    console.log('openApplyModal called with job:', job);
    console.log('Before setting - showApplyModal:', this.showApplyModal);
    console.log('Before setting - selectedJob:', this.selectedJob);
    
    this.selectedJob = job;
    this.coverLetter = ''; // Clear previous cover letter
    this.showApplyModal = true;
    
    console.log('After setting - showApplyModal:', this.showApplyModal);
    console.log('After setting - selectedJob:', this.selectedJob);
    console.log('Modal should be visible now');
    
    // Force change detection
    this.cdr.detectChanges();
    console.log('Change detection triggered');
  }

  closeApplyModal() {
    console.log('closeApplyModal called');
    console.log('Before closing - showApplyModal:', this.showApplyModal);
    this.showApplyModal = false;
    this.selectedJob = null;
    console.log('After closing - showApplyModal:', this.showApplyModal);
  }

     submitApplication() {
    console.log('submitApplication called');
    console.log('selectedJob:', this.selectedJob);
    
    if (!this.selectedJob || !this.selectedJob.id) {
      console.error('No selected job or job ID');
      alert('Error: No se seleccionó un empleo válido');
      return;
    }

    console.log('About to call applyToJob with jobId:', this.selectedJob.id);
    console.log('coverLetter:', this.coverLetter);
    
    this.applying = true;
    this.apiService.applyToJob(this.selectedJob.id, this.coverLetter).subscribe({
      next: (response: any) => {
        console.log('Application submitted successfully:', response);
        alert('¡Aplicación enviada con éxito!');
        this.closeApplyModal();
        this.applying = false;
      },
      error: (error: any) => {
        console.error('Error submitting application:', error);
        console.error('Error details:', error.error);
        
        let errorMessage = 'Error al enviar la aplicación. Por favor, intenta de nuevo.';
        
        if (error.error && error.error.error) {
          if (error.error.error.includes('Job seeker profile not found')) {
            errorMessage = 'Necesitas completar tu perfil antes de aplicar a empleos. Por favor, ve a la sección de perfil y completa tu información.';
          } else if (error.error.error.includes('already applied')) {
            errorMessage = 'Ya has aplicado a este empleo anteriormente.';
          } else if (error.error.error.includes('not found or not active')) {
            errorMessage = 'Este empleo ya no está disponible.';
          } else {
            errorMessage = error.error.error;
          }
        }
        
        alert(errorMessage);
        this.applying = false;
      }
    });
  }

  testModal() {
    console.log('testModal called');
    const testJob = this.jobRecommendations[0]; // Assuming jobRecommendations is not empty
    if (testJob) {
      this.openApplyModal(testJob);
    } else {
      alert('No job recommendations available to test.');
    }
  }
} 