import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-employers-inbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="inbox-container">
      <div class="inbox-list">
        <h2>Inbox</h2>
        <ul>
          <li *ngFor="let convo of conversations" (click)="openConversation(convo)">
            <span class="sender">{{ convo.senderName }}</span>
            <span class="preview">{{ convo.lastMessage }}</span>
            <span class="timestamp">{{ convo.lastTimestamp | date:'short' }}</span>
          </li>
        </ul>
      </div>
      <div class="chat-view" *ngIf="activeConversation">
        <h3>Chat with {{ activeConversation.senderName }}</h3>
        <div class="chat-messages">
          <div *ngFor="let msg of chatMessages" class="chat-message">
            <span class="chat-sender">{{ msg.senderName }}:</span> {{ msg.text }}
          </div>
        </div>
        <div class="chat-input-row">
          <input [(ngModel)]="chatInput" class="chat-input" placeholder="Type your message..." />
          <button (click)="sendMessage()" class="send-btn">Send</button>
        </div>
      </div>
      <div class="no-chat" *ngIf="!activeConversation">
        <p>Select a conversation to start chatting.</p>
      </div>
    </div>
  `,
  styles: [`
    .inbox-container {
      display: flex;
      gap: 2rem;
      padding: 2rem;
    }
    .inbox-list {
      width: 300px;
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      color: #111;
    }
    .inbox-list h2 {
      color: #111;
    }
    .inbox-list ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .inbox-list li {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e0e0e0;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      color: #111;
    }
    .inbox-list li:hover {
      background: #e3f2fd;
    }
    .sender {
      font-weight: bold;
      color: #1976d2;
    }
    .preview {
      color: #111;
      font-size: 0.95rem;
    }
    .timestamp {
      color: #111;
      font-size: 0.85rem;
      align-self: flex-end;
    }
    .chat-view {
      flex: 1;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      padding: 2rem;
      display: flex;
      flex-direction: column;
      height: 500px;
    }
    .chat-messages {
      flex: 1;
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
    .no-chat {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #888;
      font-size: 1.2rem;
    }
  `]
})
export class EmployersInboxComponent implements OnInit {
  conversations: any[] = [];
  activeConversation: any = null;
  chatMessages: any[] = [];
  chatInput = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadInbox();
  }

  loadInbox() {
    this.apiService.getInbox().subscribe({
      next: (convos) => {
        this.conversations = convos;
      },
      error: (err) => {
        console.error('Error loading inbox:', err);
      }
    });
  }

  openConversation(convo: any) {
    this.activeConversation = convo;
    this.apiService.getConversation(convo.partnerUserId || convo.partnerId).subscribe({
      next: (msgs) => {
        this.chatMessages = msgs;
      },
      error: (err) => {
        console.error('Error loading conversation:', err);
        this.chatMessages = [];
      }
    });
  }

  sendMessage() {
    if (this.chatInput.trim() && this.activeConversation) {
      this.apiService.sendMessage(this.activeConversation.partnerUserId || this.activeConversation.partnerId, this.chatInput).subscribe({
        next: () => {
          this.openConversation(this.activeConversation); // reload messages
          this.chatInput = '';
        },
        error: (err) => {
          console.error('Error sending message:', err);
        }
      });
    }
  }
} 