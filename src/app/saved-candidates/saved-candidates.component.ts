import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, SavedCandidate } from '../services/api.service';

@Component({
  selector: 'app-saved-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="saved-candidates-container">
      <div class="saved-candidates-box">
        <h2>Saved Candidates</h2>
        <p class="subtitle">Your shortlisted candidates</p>

        <div class="filters-section">
          <div class="search-box">
            <input 
              type="text" 
              [(ngModel)]="searchTerm" 
              (input)="filterCandidates()"
              placeholder="Search saved candidates..."
              class="search-input">
          </div>
          
          <div class="filter-options">
            <select [(ngModel)]="sortBy" (change)="filterCandidates()" class="filter-select">
              <option value="matchScore">Sort by Match Score</option>
              <option value="name">Sort by Name</option>
              <option value="dateAdded">Sort by Date Added</option>
            </select>
          </div>
        </div>

        <div class="candidates-list">
          <div *ngFor="let candidate of filteredCandidates" class="candidate-card">
            <div class="candidate-header">
              <h3>{{ candidate.name }}</h3>
              <div class="match-score" [class.high-match]="candidate.matchScore >= 80">
                {{ candidate.matchScore }}% Match
              </div>
            </div>

            <div class="skills-section">
              <h4>Skills</h4>
              <div class="skill-tags">
                <span *ngFor="let skill of candidate.skills" class="skill-tag">
                  {{ skill }}
                </span>
              </div>
            </div>

            <div class="about-section">
              <h4>About</h4>
              <p>{{ candidate.aboutMe }}</p>
            </div>

            <div class="special-needs-section" *ngIf="candidate.specialNeeds">
              <h4>Special Needs Considerations</h4>
              <p>{{ candidate.specialNeeds }}</p>
            </div>

            <div class="action-buttons">
              <button class="contact-btn">Contact Candidate</button>
              <button class="remove-btn" (click)="removeCandidate(candidate)">
                Remove from Saved
              </button>
            </div>
          </div>
        </div>

        <div class="no-candidates" *ngIf="filteredCandidates.length === 0">
          <p>No saved candidates found. Start saving candidates from the View Candidates page!</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .saved-candidates-container {
      padding: 20px;
    }

    .saved-candidates-box {
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

    .contact-btn, .remove-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
      flex: 1;
    }

    .contact-btn {
      background-color: #2196f3;
      color: white;
    }

    .contact-btn:hover {
      background-color: #1976d2;
    }

    .remove-btn {
      background-color: #f44336;
      color: white;
    }

    .remove-btn:hover {
      background-color: #d32f2f;
    }

    .no-candidates {
      text-align: center;
      color: #666;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
    }
  `]
})
export class SavedCandidatesComponent implements OnInit {
  savedCandidates: SavedCandidate[] = [];
  filteredCandidates: SavedCandidate[] = [];
  searchTerm: string = '';
  sortBy: 'matchScore' | 'name' | 'dateAdded' = 'dateAdded';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadSavedCandidates();
  }

  private loadSavedCandidates() {
    this.apiService.getSavedCandidates().subscribe({
      next: (savedCandidates) => {
        this.savedCandidates = savedCandidates;
        this.filterCandidates();
      },
      error: (error) => {
        console.error('Error loading saved candidates:', error);
        // Fallback to localStorage if API fails
        const saved = localStorage.getItem('savedCandidates');
        if (saved) {
          this.savedCandidates = JSON.parse(saved);
          this.filterCandidates();
        }
      }
    });
  }

  filterCandidates() {
    let filtered = [...this.savedCandidates];

    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(candidate =>
        candidate.skills.some((skill: string) => skill.toLowerCase().includes(searchLower)) ||
        candidate.name.toLowerCase().includes(searchLower)
      );
    }

    if (this.sortBy === 'matchScore') {
      filtered.sort((a, b) => b.matchScore - a.matchScore);
    } else if (this.sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    this.filteredCandidates = filtered;
  }

  removeCandidate(candidate: SavedCandidate) {
    this.apiService.removeSavedCandidate(candidate.job_seeker_id).subscribe({
      next: () => {
        this.savedCandidates = this.savedCandidates.filter(c => c.job_seeker_id !== candidate.job_seeker_id);
        this.filterCandidates();
      },
      error: (error) => {
        console.error('Error removing candidate:', error);
        // Fallback to localStorage
        this.savedCandidates = this.savedCandidates.filter(c => c.job_seeker_id !== candidate.job_seeker_id);
        localStorage.setItem('savedCandidates', JSON.stringify(this.savedCandidates));
        this.filterCandidates();
      }
    });
  }
} 