import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Candidate } from '../services/api.service';

@Component({
  selector: 'app-employers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="employers-container">
      <div class="employers-box">
        <h2>Personas Buscando Empleo</h2>
        <p class="subtitle">Explora candidatos potenciales</p>

        <div class="filter-bar" style="display: flex; align-items: center; gap: 1em;">
          <div class="search-box" style="flex: 1;">
            <input 
              type="text" 
              [(ngModel)]="searchTerm" 
              (input)="filterCandidates()" 
              placeholder="Buscar por habilidades..."
              class="search-input"
            />
          </div>
          
          <div style="display: flex; align-items: center; gap: 0.3em;">
            <input type="checkbox" id="savedOnlyCheckbox" [(ngModel)]="showOnlySaved" (change)="filterCandidates()" style="width: 16px; height: 16px;" />
            <label for="savedOnlyCheckbox" style="font-size: 0.95em; margin: 0;color:black">Mostrar solo guardados</label>
          </div>
          <div style="margin-left: auto;">
            <select [(ngModel)]="sortBy" (change)="filterCandidates()" class="sort-select">
              <option value="matchScore">Ordenar por Coincidencia</option>
              <option value="name">Ordenar por Nombre</option>
            </select>
          </div>
        </div>

        <div class="candidates-list">
          <div *ngFor="let candidate of filteredCandidates" class="candidate-card">
            <div class="candidate-header">
              <h3>{{ candidate.username || candidate.name }}</h3>
              <div class="match-score" [class.high-match]="candidate.matchScore >= 80">
                {{ candidate.matchScore }}% Match
              </div>
            </div>
            <div class="user-info-section">
              <p><strong>Username:</strong> {{ candidate.username || 'N/A' }}</p>
              <p><strong>Email:</strong> {{ candidate.email || 'N/A' }}</p>
            </div>
            <div class="skills-section">
              <h4>Habilidades</h4>
              <div class="skill-tags">
                <span *ngFor="let skill of candidate.skills" class="skill-tag">
                  {{ skill }}
                </span>
              </div>
            </div>
            <div class="about-section">
              <h4>Acerca de</h4>
              <p>{{ candidate.aboutMe }}</p>
            </div>
            <div class="special-needs-section" *ngIf="candidate.specialNeeds">
              <h4>Consideraciones de Necesidades Especiales</h4>
              <p>{{ candidate.specialNeeds }}</p>
            </div>
            <div class="action-buttons">
              <button class="contact-btn" (click)="openChat(candidate)">Contactar Candidato</button>
              <button 
                class="save-btn" 
                [class.saved]="isCandidateSaved(candidate)"
                (click)="toggleSaveCandidate(candidate)">
                {{ isCandidateSaved(candidate) ? 'Guardado' : 'Guardar para después' }}
              </button>
            </div>
          </div>
        </div>

        <div class="no-candidates" *ngIf="filteredCandidates.length === 0">
          <p>No hay candidatos que coincidan con tus criterios de búsqueda.</p>
        </div>
      </div>
    </div>
    <div class="chat-modal" *ngIf="showChat">
      <div class="chat-box">
        <h3>Chatear con {{ chatCandidate?.name }}</h3>
        <div class="chat-messages">
          <div *ngFor="let msg of chatMessages" class="chat-message">
            <span class="chat-sender">{{ msg.sender }}:</span> {{ msg.text }}
          </div>
        </div>
        <div class="chat-input-row">
          <input [(ngModel)]="chatInput" class="chat-input" placeholder="Escribe tu mensaje..." />
          <button (click)="sendMessage()" class="send-btn">Enviar</button>
          <button (click)="closeChat()" class="close-btn">Cerrar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .employers-container {
      padding: 20px;
    }

    .employers-box {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      max-width: 1000px;
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

    .filters-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .search-box {
      flex: 1;
      min-width: 250px;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
    }

    .filter-select {
      padding: 0.75rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      min-width: 200px;
    }

    .candidate-card {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      transition: transform 0.3s ease;
    }

    .candidate-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .candidate-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .candidate-header h3 {
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

    .skills-section, .about-section, .special-needs-section {
      margin-bottom: 1.5rem;
    }

    h4 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .skill-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .skill-tag {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.3rem 0.8rem;
      border-radius: 16px;
      font-size: 0.85rem;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .contact-btn, .save-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s;
      flex: 1;
    }

    .contact-btn {
      background-color: #2196f3;
      color: white;
    }

    .contact-btn:hover {
      background-color: #1976d2;
    }

    .save-btn {
      background-color: #e9ecef;
      color: #495057;
    }

    .save-btn:hover {
      background-color: #dee2e6;
    }

    .save-btn.saved {
      background-color: #4caf50;
      color: white;
    }

    .save-btn.saved:hover {
      background-color: #43a047;
    }

    .no-candidates {
      text-align: center;
      color: #666;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .user-info-section {
      margin-bottom: 1rem;
      color: #333;
    }
    .chat-modal {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }
    .chat-box {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      max-width: 400px;
      width: 100%;
    }
    .chat-messages {
      max-height: 200px;
      overflow-y: auto;
      margin-bottom: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
    }
    .chat-message {
      margin-bottom: 0.5rem;
      color: #111;
    }
    .chat-sender {
      font-weight: bold;
      margin-right: 0.5rem;
    }
    .chat-input-row {
      display: flex;
      gap: 0.5rem;
    }
    .chat-input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      font-size: 1rem;
    }
    .send-btn {
      background: #2196f3;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      cursor: pointer;
    }
    .close-btn {
      background: #e0e0e0;
      color: #333;
      border: none;
      border-radius: 6px;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      cursor: pointer;
    }
  `]
})
export class EmployersComponent implements OnInit {
  candidates: Candidate[] = [];
  filteredCandidates: Candidate[] = [];
  savedCandidates: any[] = [];
  searchTerm: string = '';
  sortBy: 'matchScore' | 'name' = 'matchScore';
  showOnlySaved: boolean = false;

  showChat = false;
  chatCandidate: Candidate | null = null;
  chatMessages: { sender: string, text: string }[] = [];
  chatInput = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadCandidates();
    this.loadSavedCandidates();
  }

  private loadCandidates() {
    this.apiService.getCandidates().subscribe({
      next: (candidates) => {
        this.candidates = candidates;
        this.filterCandidates();
      },
      error: (error) => {
        console.error('Error loading candidates:', error);
        // Fallback to mock data if API fails
        this.candidates = [
          {
            id: 1,
            user_id: 0,
            name: 'John Doe',
            skills: ['Communication', 'Problem Solving', 'Customer Service'],
            specialNeeds: 'Visual Impairment - Screen Reader Required',
            aboutMe: 'Experienced customer service professional with strong communication skills.',
            matchScore: 85
          },
          {
            id: 2,
            user_id: 0,
            name: 'Jane Smith',
            skills: ['Data Analysis', 'Organization', 'Research'],
            specialNeeds: 'Mobility Assistance Required',
            aboutMe: 'Detail-oriented data analyst with experience in research and organization.',
            matchScore: 90
          },
          {
            id: 3,
            user_id: 0,
            name: 'Mike Johnson',
            skills: ['Writing', 'Creativity', 'Time Management'],
            specialNeeds: '',
            aboutMe: 'Creative writer with excellent time management skills.',
            matchScore: 75
          }
        ];
        this.filterCandidates();
      }
    });
  }

  private loadSavedCandidates() {
    this.apiService.getSavedCandidates().subscribe({
      next: (savedCandidates) => {
        this.savedCandidates = savedCandidates;
      },
      error: (error) => {
        console.error('Error loading saved candidates:', error);
        // Fallback to localStorage if API fails
        const saved = localStorage.getItem('savedCandidates');
        if (saved) {
          this.savedCandidates = JSON.parse(saved);
        }
      }
    });
  }

  filterCandidates() {
    let filtered = [...this.candidates];

    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(candidate =>
        candidate.skills.some(skill => skill.toLowerCase().includes(searchLower)) ||
        candidate.name.toLowerCase().includes(searchLower) ||
        (candidate.username && candidate.username.toLowerCase().includes(searchLower))
      );
    }
    if (this.showOnlySaved) {
      filtered = filtered.filter(candidate => candidate.saved);
    }

    if (this.sortBy === 'matchScore') {
      filtered.sort((a, b) => b.matchScore - a.matchScore);
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    this.filteredCandidates = filtered;
  }

  isCandidateSaved(candidate: Candidate): boolean {
    return !!candidate.saved;
  }

  toggleSaveCandidate(candidate: Candidate) {
    const isSaved = !!candidate.saved;
    if (!isSaved) {
      // Save candidate
      this.apiService.saveCandidate(candidate.id, '', candidate.matchScore).subscribe({
        next: () => {
          candidate.saved = true;
        },
        error: (error) => {
          console.error('Error saving candidate:', error);
          candidate.saved = true;
        }
      });
    } else {
      // Remove candidate
      this.apiService.removeSavedCandidate(candidate.id).subscribe({
        next: () => {
          candidate.saved = false;
        },
        error: (error) => {
          console.error('Error removing candidate:', error);
          candidate.saved = false;
        }
      });
    }
  }

  openChat(candidate: Candidate) {
    this.showChat = true;
    this.chatCandidate = candidate;
    this.chatMessages = [];
    this.chatInput = '';
    // Load real messages from backend
    this.apiService.getConversation(candidate.user_id).subscribe({
      next: (msgs) => {
        this.chatMessages = msgs;
      },
      error: (err) => {
        console.error('Error loading conversation:', err);
        this.chatMessages = [];
      }
    });
  }

  closeChat() {
    this.showChat = false;
    this.chatCandidate = null;
    this.chatMessages = [];
    this.chatInput = '';
  }

  sendMessage() {
    if (this.chatInput.trim() && this.chatCandidate) {
      this.apiService.sendMessage(this.chatCandidate.user_id, this.chatInput).subscribe({
        next: () => {
          this.openChat(this.chatCandidate!); // reload messages
          this.chatInput = '';
        },
        error: (err) => {
          console.error('Error sending message:', err);
        }
      });
    }
  }
} 