import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
  userType: 'jobseeker' | 'employer';
}

export interface JobSeekerProfile {
  id?: number;
  user_id?: number;
  first_name: string;
  last_name: string;
  about_me?: string;
  special_needs?: string;
  disability_type?: string;
  custom_disability?: string;
}

export interface Skill {
  id: number;
  name: string;
  category?: string;
}

export interface Candidate {
  id: number;
  user_id: number; // Add user_id for messaging
  name: string;
  skills: string[];
  specialNeeds: string;
  aboutMe: string;
  matchScore: number;
  disability_type?: string;
  custom_disability?: string;
  username?: string;
  email?: string;
  saved?: boolean;
}

export interface JobRecommendation {
  id?: number;
  title: string;
  description: string;
  matchScore: number;
  skills: string[];
  whyGood: string[];
  location?: string;
  salary_range?: string;
  job_type?: string;
  employer_id?: number;
  status?: string;
}

export interface SavedCandidate {
  id: number;
  job_seeker_id: number;
  name: string;
  skills: string[];
  specialNeeds: string;
  aboutMe: string;
  matchScore: number;
  notes?: string;
  saved_at: string;
}

export interface JobPosting {
  id: number;
  employer_id: number;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary_range: string;
  job_type: string;
  status: 'active' | 'closed' | 'draft';
  created_at: string;
  updated_at: string;
  applications_count: number;
}

export interface JobApplication {
  id: number;
  job_posting_id: number;
  job_seeker_id: number;
  job_seeker_name?: string;
  job_seeker?: JobSeekerProfile;
  job_title?: string;
  company_name?: string;
  location?: string;
  salary_range?: string;
  job_type?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  applied_at: string;
  cover_letter?: string;
  resume_url?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3001/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load user from localStorage on service initialization
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      this.currentUserSubject.next(JSON.parse(userStr));
    }
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
    
    console.log('Final headers:', headers);
    return headers;
  }

  // Authentication
  login(username: string, password: string, userType: 'jobseeker' | 'employer'): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, {
      username,
      password,
      userType
    }).pipe(
      map((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userType', response.user.userType);
          this.currentUserSubject.next(response.user);
        }
        return response;
      })
    );
  }

  register(username: string, email: string, password: string, userType: 'jobseeker' | 'employer', firstName: string, lastName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, {
      username,
      email,
      password,
      userType,
      first_name: firstName,
      last_name: lastName
    }).pipe(
      map((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userType', response.user.userType);
          this.currentUserSubject.next(response.user);
        }
        return response;
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    this.currentUserSubject.next(null);
  }

  // Job Seeker Profile
  saveJobSeekerProfile(profile: JobSeekerProfile): Observable<any> {
    return this.http.post(`${this.apiUrl}/job-seeker/profile`, profile, {
      headers: this.getHeaders()
    });
  }

  getJobSeekerProfile(): Observable<JobSeekerProfile> {
    return this.http.get<JobSeekerProfile>(`${this.apiUrl}/job-seeker/profile`, {
      headers: this.getHeaders()
    });
  }

  // Skills
  getSkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.apiUrl}/skills`);
  }

  saveJobSeekerSkills(skillIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/job-seeker/skills`, { skills: skillIds }, {
      headers: this.getHeaders()
    });
  }

  getJobSeekerSkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.apiUrl}/job-seeker/skills`, {
      headers: this.getHeaders()
    });
  }

  // Candidates (for employers)
  getCandidates(search?: string, sortBy?: string): Observable<Candidate[]> {
    let url = `${this.apiUrl}/candidates`;
    const params: string[] = [];
    
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (sortBy) params.push(`sortBy=${sortBy}`);
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<Candidate[]>(url, {
      headers: this.getHeaders()
    });
  }

  // Saved Candidates
  saveCandidate(jobSeekerId: number, notes?: string, matchScore?: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/saved-candidates`, {
      job_seeker_id: jobSeekerId,
      notes,
      match_score: matchScore
    }, {
      headers: this.getHeaders()
    });
  }

  getSavedCandidates(): Observable<SavedCandidate[]> {
    return this.http.get<SavedCandidate[]>(`${this.apiUrl}/saved-candidates`, {
      headers: this.getHeaders()
    });
  }

  removeSavedCandidate(candidateId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/saved-candidates/${candidateId}`, {
      headers: this.getHeaders()
    });
  }

  // Job Recommendations
  getJobRecommendations(): Observable<JobRecommendation[]> {
    return this.http.get<JobRecommendation[]>(`${this.apiUrl}/job-recommendations`, {
      headers: this.getHeaders()
    });
  }

  // Get all active job postings for job seekers
  getActiveJobPostings(): Observable<JobPosting[]> {
    return this.http.get<JobPosting[]>(`${this.apiUrl}/job-postings/active`);
  }

  // Health check
  healthCheck(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }

  // Utility methods
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserType(): 'jobseeker' | 'employer' | null {
    const user = this.getCurrentUser();
    return user ? user.userType : null;
  }

  // Messaging
  sendMessage(receiverId: number, message: string, subject?: string) {
    return this.http.post(`${this.apiUrl}/messages`, {
      receiver_id: receiverId,
      message,
      subject: subject || ''
    }, { headers: this.getHeaders() });
  }

  getInbox() {
    return this.http.get<any[]>(`${this.apiUrl}/messages/inbox`, { headers: this.getHeaders() });
  }

  getConversation(partnerId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/messages/conversation/${partnerId}`, { headers: this.getHeaders() });
  }

  // Job Postings (for employers)
  createJobPosting(jobData: Omit<JobPosting, 'id' | 'employer_id' | 'created_at' | 'updated_at' | 'applications_count'>): Observable<JobPosting> {
    return this.http.post<JobPosting>(`${this.apiUrl}/job-postings`, jobData, {
      headers: this.getHeaders()
    });
  }

  getMyJobPostings(): Observable<JobPosting[]> {
    return this.http.get<JobPosting[]>(`${this.apiUrl}/employer/job-postings`, {
      headers: this.getHeaders()
    });
  }

  updateJobPosting(jobId: number, jobData: Partial<JobPosting>): Observable<JobPosting> {
    return this.http.put<JobPosting>(`${this.apiUrl}/job-postings/${jobId}`, jobData, {
      headers: this.getHeaders()
    });
  }

  deleteJobPosting(jobId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/job-postings/${jobId}`, {
      headers: this.getHeaders()
    });
  }

  toggleJobStatus(jobId: number, status: 'active' | 'closed'): Observable<JobPosting> {
    return this.http.patch<JobPosting>(`${this.apiUrl}/job-postings/${jobId}/status`, { status }, {
      headers: this.getHeaders()
    });
  }

  getJobApplications(jobId: number): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(`${this.apiUrl}/job-postings/${jobId}/applications`, {
      headers: this.getHeaders()
    });
  }

  updateApplicationStatus(applicationId: number, status: 'pending' | 'reviewed' | 'accepted' | 'rejected'): Observable<JobApplication> {
    return this.http.patch<JobApplication>(`${this.apiUrl}/applications/${applicationId}/status`, { status }, {
      headers: this.getHeaders()
    });
  }

  // Apply to a job posting
  applyToJob(jobId: number, coverLetter?: string): Observable<any> {
    console.log('applyToJob called with jobId:', jobId, 'coverLetter:', coverLetter);
    console.log('Headers being sent:', this.getHeaders());
    
    return this.http.post(`${this.apiUrl}/job-postings/${jobId}/apply`, { 
      cover_letter: coverLetter 
    }, {
      headers: this.getHeaders()
    });
  }

  // Get user's job applications
  getMyApplications(): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(`${this.apiUrl}/job-seeker/applications`, {
      headers: this.getHeaders()
    });
  }

  // Get job seeker profile by ID (for employers)
  getJobSeekerProfileById(jobSeekerId: number): Observable<JobSeekerProfile> {
    return this.http.get<JobSeekerProfile>(`${this.apiUrl}/job-seeker/profile/${jobSeekerId}`, {
      headers: this.getHeaders()
    });
  }

  // Get job seeker skills by ID (for employers)
  getJobSeekerSkillsById(jobSeekerId: number): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.apiUrl}/job-seeker/skills/${jobSeekerId}`, {
      headers: this.getHeaders()
    });
  }

  // Update job application status
  updateJobApplicationStatus(applicationId: number, status: 'pending' | 'reviewed' | 'accepted' | 'rejected'): Observable<JobApplication> {
    return this.http.patch<JobApplication>(`${this.apiUrl}/applications/${applicationId}/status`, { status }, {
      headers: this.getHeaders()
    });
  }
} 