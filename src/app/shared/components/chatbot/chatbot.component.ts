import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  HostListener,
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

export type ChartDestination = 'current' | 'other' | 'new-chart' | 'new-dashboard';

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
  @Output() addChartToDashboard = new EventEmitter<{
    dashboardId: string | null;
    chartPrompt: string;
    chartTitle: string;
  }>();
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  messages$!: Observable<ChatMessage[]>;
  userInput = '';
  isTyping = false;
  isMinimized = false;
  showContextDropdown = false;
  showDashboardListExpanded = false; // For expanded dashboard list
  showChartDestinationModal = false;
  showOtherDashboardsDropdown = false;
  pendingChartData: { prompt: string; title: string } | null = null;
  selectedOtherDashboardId: string = '';

  // Context options
  contextMode: 'current' | 'all' | 'specific' = 'current';
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

    // Watch for chart data in messages
    this.messages$.subscribe((messages) => {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant' && lastMessage.chartData) {
        // Automatically show the chart destination modal
        this.pendingChartData = lastMessage.chartData;
        this.showChartDestinationModal = true;
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInsideContext = target.closest('.context-dropdown-container');
    const clickedInsideOtherDashboards = target.closest('.other-dashboards-dropdown');

    if (!clickedInsideContext && this.showContextDropdown) {
      this.showContextDropdown = false;
      this.showDashboardListExpanded = false;
    }

    if (!clickedInsideOtherDashboards && this.showOtherDashboardsDropdown) {
      this.showOtherDashboardsDropdown = false;
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
    // Check if it's "Add a chart" suggestion
    if (
      suggestion.toLowerCase().includes('add a chart') ||
      suggestion.toLowerCase().includes('create a chart')
    ) {
      this.initiateChartCreation();
    } else {
      this.userInput = suggestion;
      this.sendMessage();
    }
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

  // Show chart creation flow
  initiateChartCreation(): void {
    this.chatService.sendMessage(
      'What would you like to visualize? Please describe the chart you need.',
    );
  }

  // Handle chart prompt from user message
  handleChartPromptResponse(prompt: string): void {
    const title = this.extractChartTitle(prompt);
    this.pendingChartData = { prompt, title };
    this.showChartDestinationModal = true;
  }

  private extractChartTitle(message: string): string {
    const patterns = [
      /chart (?:for|about|of|showing) (.+)/i,
      /show (?:me )?(?:a )?(.+) chart/i,
      /create (?:a )?(.+) chart/i,
      /visualize (.+)/i,
      /graph (?:for|about|of) (.+)/i,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return 'AI Generated Chart';
  }

  // Handle destination selection
  selectChartDestination(destination: ChartDestination, dashboardId?: string): void {
    if (!this.pendingChartData) return;

    if (destination === 'current') {
      // Add to current dashboard
      this.addChartToDashboard.emit({
        dashboardId: this.currentDashboardId,
        chartPrompt: this.pendingChartData.prompt,
        chartTitle: this.pendingChartData.title,
      });
      this.chatService.sendMessage(`Added "${this.pendingChartData.title}" to current dashboard!`);
      this.showChartDestinationModal = false;
      this.pendingChartData = null;
    } else if (destination === 'other' && dashboardId) {
      // Add to selected dashboard
      this.addChartToDashboard.emit({
        dashboardId: dashboardId,
        chartPrompt: this.pendingChartData.prompt,
        chartTitle: this.pendingChartData.title,
      });
      this.chatService.sendMessage(`Added "${this.pendingChartData.title}" to dashboard!`);
      this.showChartDestinationModal = false;
      this.showOtherDashboardsDropdown = false;
      this.pendingChartData = null;
    } else if (destination === 'new-chart') {
      // Create another chart
      this.showChartDestinationModal = false;
      this.pendingChartData = null;
      this.initiateChartCreation();
    } else if (destination === 'new-dashboard') {
      // Create new dashboard with this chart
      this.addChartToDashboard.emit({
        dashboardId: null,
        chartPrompt: this.pendingChartData.prompt,
        chartTitle: this.pendingChartData.title,
      });
      this.chatService.sendMessage(
        `Created new dashboard with "${this.pendingChartData.title}" chart!`,
      );
      this.showChartDestinationModal = false;
      this.pendingChartData = null;
    }
  }

  toggleOtherDashboardsDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.showOtherDashboardsDropdown = !this.showOtherDashboardsDropdown;
  }

  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
  }

  toggleContextDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.showContextDropdown = !this.showContextDropdown;
    if (!this.showContextDropdown) {
      this.showDashboardListExpanded = false;
    }
  }

  toggleDashboardListExpanded(event: MouseEvent): void {
    event.stopPropagation();
    this.showDashboardListExpanded = !this.showDashboardListExpanded;
  }

  selectContext(
    mode: 'current' | 'all' | 'specific',
    dashboardId?: string,
    event?: MouseEvent,
  ): void {
    if (event) {
      event.stopPropagation();
    }

    this.contextMode = mode;

    if (mode === 'specific' && dashboardId) {
      this.selectedDashboardId = dashboardId;
    } else if (mode === 'current') {
      this.selectedDashboardId = this.currentDashboardId;
    }

    this.showContextDropdown = false;
    this.showDashboardListExpanded = false;
    this.updateContext();
  }

  getContextLabel(): string {
    switch (this.contextMode) {
      case 'current':
        return 'Current Dashboard';
      case 'all':
        return 'All Dashboards';
      case 'specific':
        const dashboard = this.availableDashboards.find((d) => d.id === this.selectedDashboardId);
        return dashboard ? dashboard.name : 'Specific Dashboard';
      default:
        return 'Current Dashboard';
    }
  }

  // Get all available dashboards
  getAllDashboards(): DashboardInfo[] {
    return this.availableDashboards;
  }

  // Get top 3 dashboards for display in dropdown
  getTopDashboards(): DashboardInfo[] {
    return this.availableDashboards.slice(0, 3);
  }

  // Get remaining dashboards (after top 3)
  getRemainingDashboards(): DashboardInfo[] {
    return this.availableDashboards.slice(3);
  }

  hasMoreDashboards(): boolean {
    return this.availableDashboards.length > 3;
  }

  getMoreDashboardsCount(): number {
    return Math.max(0, this.availableDashboards.length - 3);
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
