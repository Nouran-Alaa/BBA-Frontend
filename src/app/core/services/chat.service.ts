import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  templateId?: string;
  dashboardPreview?: any;
}

export interface ChatContext {
  currentDashboardId?: string;
  allDashboards?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private messages = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.messages.asObservable();

  private context: ChatContext = {};
  private conversationHistory: ChatMessage[] = [];

  constructor() {
    this.initializeChat();
  }

  private initializeChat(): void {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content:
        "Hi! I'm your dashboard assistant. I can help you create new dashboards, analyze your data, and answer questions about your analytics. What would you like to do today?",
      timestamp: new Date(),
      suggestions: [
        'Create a new dashboard',
        'Show me social media analytics',
        'Tell me about my current dashboard',
        'What templates are available?',
      ],
    };

    this.conversationHistory.push(welcomeMessage);
    this.messages.next([...this.conversationHistory]);
  }

  setContext(context: ChatContext): void {
    this.context = context;
  }

  async sendMessage(userMessage: string): Promise<void> {
    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    this.conversationHistory.push(userMsg);
    this.messages.next([...this.conversationHistory]);

    // Simulate AI response (replace with real API call)
    setTimeout(() => {
      const response = this.generateResponse(userMessage);
      this.conversationHistory.push(response);
      this.messages.next([...this.conversationHistory]);
    }, 1000);
  }

  private generateResponse(userMessage: string): ChatMessage {
    const message = userMessage.toLowerCase();

    // Template suggestions
    if (
      message.includes('social media') ||
      message.includes('facebook') ||
      message.includes('instagram')
    ) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content:
          'I can help you create a social media analytics dashboard! This will track engagement, reach, followers, and post performance across all your social platforms.',
        timestamp: new Date(),
        templateId: 'social-media',
        suggestions: [
          'Create this dashboard',
          'Show me more options',
          'What other templates are available?',
        ],
      };
    }

    if (message.includes('youtube') || message.includes('video')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content:
          'Perfect! I can set up a YouTube Analytics dashboard for you. It will show views, subscribers, watch time, and top-performing videos.',
        timestamp: new Date(),
        templateId: 'youtube',
        suggestions: ['Create YouTube dashboard', 'Show different template', 'Customize it first'],
      };
    }

    if (
      message.includes('executive') ||
      message.includes('summary') ||
      message.includes('overview')
    ) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content:
          "I'll create an Executive Summary dashboard with high-level KPIs, trends, and strategic insights. This is perfect for leadership presentations.",
        timestamp: new Date(),
        templateId: 'executive',
        suggestions: ['Create executive dashboard', 'Show me templates', 'Tell me more'],
      };
    }

    if (message.includes('create') || message.includes('new dashboard')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content:
          'I can help you create a new dashboard! What type of data would you like to track? Choose from:\n\n• Social Media Analytics\n• YouTube Performance\n• Instagram Insights\n• Facebook Analytics\n• Executive Summary\n• Twitter Analytics\n• TikTok Metrics\n• Or tell me what you need!',
        timestamp: new Date(),
        suggestions: [
          'Social media dashboard',
          'YouTube analytics',
          'Executive summary',
          'Show all templates',
        ],
      };
    }

    if (message.includes('template') || message.includes('available')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content:
          'Here are the available dashboard templates:\n\n📱 Social Media Analytics\n📹 YouTube Analytics\n📸 Instagram Insights\n📘 Facebook Page Analytics\n📊 Executive Summary\n🐦 Twitter (X) Analytics\n🎵 TikTok Analytics\n\nWhich one interests you?',
        timestamp: new Date(),
        suggestions: [
          'Social media template',
          'YouTube template',
          'Executive template',
          'Custom dashboard',
        ],
      };
    }

    if (message.includes('current') || message.includes('this dashboard')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: this.context.currentDashboardId
          ? `You're currently viewing Dashboard ${this.context.currentDashboardId}. It has ${this.getCurrentDashboardInfo()} widgets. Would you like to add more widgets or create a new dashboard?`
          : "You don't have a dashboard selected yet. Would you like me to create one for you?",
        timestamp: new Date(),
        suggestions: ['Add widgets', 'Create new dashboard', 'Show analytics'],
      };
    }

    // Default response
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content:
        "I'm here to help you with your dashboards! You can ask me to:\n\n• Create a new dashboard\n• Add widgets to existing dashboards\n• Analyze your data\n• Get insights and recommendations\n\nWhat would you like to do?",
      timestamp: new Date(),
      suggestions: ['Create a dashboard', 'Show templates', 'Help me analyze data'],
    };
  }

  private getCurrentDashboardInfo(): string {
    // This will be populated from the dashboard service
    return '4';
  }

  clearChat(): void {
    this.conversationHistory = [];
    this.initializeChat();
  }

  getContext(): ChatContext {
    return this.context;
  }
}
