import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../../../core/services/chat.service';
import {
  DashboardTemplateService,
  DashboardTemplate,
} from '../../../core/services/dashboard-template.service';
import { Observable } from 'rxjs';

export interface DashboardInfo {
  id: string;
  name: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @Input() availableDashboards: DashboardInfo[] = [];
  @Input() currentDashboardId: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() createDashboard = new EventEmitter<{ templateId: string; name: string }>();
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  messages$!: Observable<ChatMessage[]>;
  userInput = '';
  isTyping = false;
  isMinimized = false;
  showContextDropdown = false;

  // Context options
  contextMode: 'none' | 'current' | 'all' | 'specific' = 'current';
  selectedDashboardId: string = '';

  private shouldScroll = false;

  constructor(
    private chatService: ChatService,
    private templateService: DashboardTemplateService,
  ) {}

  ngOnInit(): void {
    this.messages$ = this.chatService.messages$;
    this.selectedDashboardId = this.currentDashboardId;
    this.updateContext();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  sendMessage(): void {
    if (!this.userInput.trim()) return;

    const message = this.userInput;
    this.userInput = '';
    this.isTyping = true;
    this.shouldScroll = true;

    this.chatService.sendMessage(message);

    setTimeout(() => {
      this.isTyping = false;
      this.shouldScroll = true;
    }, 1000);
  }

  useSuggestion(suggestion: string): void {
    this.userInput = suggestion;
    this.sendMessage();
  }

  createDashboardFromTemplate(templateId: string): void {
    const template: DashboardTemplate | undefined =
      this.templateService.getTemplateById(templateId);
    if (template) {
      this.createDashboard.emit({
        templateId,
        name: template.name,
      });
      this.chatService.sendMessage(`Created ${template.name} dashboard!`);
    }
  }

  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
  }

  toggleContextDropdown(): void {
    this.showContextDropdown = !this.showContextDropdown;
  }

  selectContext(mode: 'none' | 'current' | 'all' | 'specific', dashboardId?: string): void {
    this.contextMode = mode;

    if (mode === 'specific' && dashboardId) {
      this.selectedDashboardId = dashboardId;
    } else if (mode === 'current') {
      this.selectedDashboardId = this.currentDashboardId;
    }

    this.showContextDropdown = false;
    this.updateContext();
  }

  getContextLabel(): string {
    switch (this.contextMode) {
      case 'none':
        return 'General Chat';
      case 'current':
        return 'Current Dashboard';
      case 'all':
        return 'All Dashboards';
      case 'specific':
        const dashboard = this.availableDashboards.find((d) => d.id === this.selectedDashboardId);
        return dashboard ? dashboard.name : 'Specific Dashboard';
      default:
        return 'General Chat';
    }
  }

  private updateContext(): void {
    this.chatService.setContext({
      currentDashboardId:
        this.contextMode === 'current' || this.contextMode === 'specific'
          ? this.selectedDashboardId
          : undefined,
      allDashboards: this.contextMode === 'all',
    });
  }

  onClose(): void {
    this.close.emit();
  }

  clearChat(): void {
    this.chatService.clearChat();
  }

  private scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop =
        this.messageContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
