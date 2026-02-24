import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  templateId?: string;
  chartData?: { prompt: string; title: string };
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
  private waitingForChartPrompt = false;

  constructor() {
    this.initializeChat();
  }

  private initializeChat(): void {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content:
        "Hi! I'm your dashboard assistant. I can help you:\n\n• Create new dashboards\n• Add charts and widgets\n• Analyze your data\n• Answer questions\n\nWhat would you like to do?",
      timestamp: new Date(),
      suggestions: ['Create a new dashboard', 'Add a chart', 'Show available templates'],
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

    // Simulate AI response
    setTimeout(() => {
      const response = this.generateResponse(userMessage);
      this.conversationHistory.push(response);
      this.messages.next([...this.conversationHistory]);
    }, 1000);
  }

  private generateResponse(userMessage: string): ChatMessage {
    const message = userMessage.toLowerCase();

    // If we're waiting for a chart prompt, treat this message as the chart description
    if (this.waitingForChartPrompt) {
      this.waitingForChartPrompt = false;
      const chartTitle = this.extractChartTitle(userMessage);
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Great! I'll create a chart for "${chartTitle}". Where would you like to add it?`,
        timestamp: new Date(),
        chartData: {
          prompt: userMessage,
          title: chartTitle,
        },
      };
    }

    // Chart creation requests
    if (
      message.includes('add a chart') ||
      message.includes('create a chart') ||
      (message.includes('chart') && (message.includes('create') || message.includes('add')))
    ) {
      this.waitingForChartPrompt = true;
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content:
          "I'll help you create a chart! Please describe what you'd like to visualize.\n\nFor example:\n• Monthly revenue trends\n• User growth over time\n• Sales by region",
        timestamp: new Date(),
        suggestions: [],
      };
    }

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
        suggestions: ['Create this dashboard', 'Show me more templates', 'Add a custom chart'],
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
        suggestions: ['Create YouTube dashboard', 'Show different template', 'Add custom widget'],
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
          "I'll create an Executive Summary dashboard with high-level KPIs, trends, and strategic insights. Perfect for leadership presentations!",
        timestamp: new Date(),
        templateId: 'executive',
        suggestions: ['Create executive dashboard', 'Show me templates', 'Add custom metrics'],
      };
    }

    if (message.includes('create') || message.includes('new dashboard')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content:
          'I can help you create a new dashboard! What type of data would you like to track?\n\n📱 Social Media Analytics\n📹 YouTube Performance\n📸 Instagram Insights\n📊 Executive Summary\n🐦 Twitter Analytics\n🎵 TikTok Metrics',
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
          'Here are the available dashboard templates:\n\n📱 Social Media Analytics\n📹 YouTube Analytics\n📸 Instagram Insights\n📊 Executive Summary\n🐦 Twitter Analytics\n🎵 TikTok Analytics',
        timestamp: new Date(),
        suggestions: ['Social media template', 'YouTube template', 'Executive template'],
      };
    }

    // Default response
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content:
        "I'm here to help you with your dashboards! You can:\n\n• Create a new dashboard\n• Add charts and widgets\n• Get insights from your data\n• Ask questions about analytics\n\nWhat would you like to do?",
      timestamp: new Date(),
      suggestions: ['Create a dashboard', 'Add a chart', 'Show templates'],
    };
  }

  private extractChartTitle(message: string): string {
    // Simple extraction - can be improved with NLP
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

  clearChat(): void {
    this.conversationHistory = [];
    this.waitingForChartPrompt = false;
    this.initializeChat();
  }

  getContext(): ChatContext {
    return this.context;
  }
}
