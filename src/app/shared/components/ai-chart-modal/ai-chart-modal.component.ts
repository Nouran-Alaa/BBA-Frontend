import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ChartTemplate {
  id: string;
  title: string;
  description: string;
  chartType: string;
  icon: string;
  preview: string;
  category: string;
  examplePrompts: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  preview?: {
    type: string;
    title: string;
    prompt: string;
  };
}

@Component({
  selector: 'app-ai-chart-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chart-modal.component.html',
  styleUrls: ['./ai-chart-modal.component.css'],
})
export class AiChartModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() generate = new EventEmitter<string>();

  searchQuery: string = '';
  selectedCategory: string = 'All';
  selectedTemplate: ChartTemplate | null = null;
  showChat: boolean = false;

  chatMessages: ChatMessage[] = [];
  userMessage: string = '';
  isGenerating: boolean = false;
  currentPreview: any = null;

  categories = ['All', 'Engagement', 'Growth', 'Content', 'Audience', 'Performance'];

  templates: ChartTemplate[] = [
    {
      id: 'custom',
      title: 'Custom Chart',
      description: 'Describe your chart and AI will create it for you',
      chartType: 'AI Direct',
      icon: '🤖',
      preview: 'custom',
      category: 'All',
      examplePrompts: [
        'Show me engagement trends over the last 30 days',
        'Compare follower growth across all platforms',
        'Display top 10 posts by likes this month',
      ],
    },
    {
      id: 'engagement-trend',
      title: 'Engagement Rate Trend',
      description: 'Track engagement over time',
      chartType: 'Line Chart',
      icon: '📈',
      preview: 'line',
      category: 'Engagement',
      examplePrompts: [
        'Show engagement for the last 7 days',
        'Compare engagement between platforms',
        'Show hourly engagement patterns',
      ],
    },
    {
      id: 'post-performance',
      title: 'Post Performance',
      description: 'Compare different post types',
      chartType: 'Bar Chart',
      icon: '📊',
      preview: 'bar',
      category: 'Content',
      examplePrompts: [
        'Show top 5 posts by engagement',
        'Compare videos vs images performance',
        'Show post performance by day of week',
      ],
    },
    {
      id: 'platform-split',
      title: 'Platform Distribution',
      description: 'Followers across platforms',
      chartType: 'Pie Chart',
      icon: '🥧',
      preview: 'pie',
      category: 'Audience',
      examplePrompts: [
        'Show follower distribution',
        'Compare audience size by platform',
        'Display engagement share per platform',
      ],
    },
    {
      id: 'growth',
      title: 'Follower Growth',
      description: 'Track growth over time',
      chartType: 'Area Chart',
      icon: '📈',
      preview: 'area',
      category: 'Growth',
      examplePrompts: [
        'Show growth for last 90 days',
        'Compare growth rate by platform',
        'Highlight growth milestones',
      ],
    },
    {
      id: 'top-content',
      title: 'Top Content',
      description: 'Best performing posts',
      chartType: 'Bar Chart',
      icon: '🏆',
      preview: 'bar',
      category: 'Performance',
      examplePrompts: [
        'Top 10 posts this month',
        'Best performing content types',
        'Highest engagement posts',
      ],
    },
    {
      id: 'story-metrics',
      title: 'Story Performance',
      description: 'Instagram & Facebook stories',
      chartType: 'Line Chart',
      icon: '📱',
      preview: 'line',
      category: 'Content',
      examplePrompts: [
        'Story views over 2 weeks',
        'Story completion rates',
        'Compare story vs post engagement',
      ],
    },
    {
      id: 'demographics',
      title: 'Audience Demographics',
      description: 'Age and gender breakdown',
      chartType: 'Stacked Bar',
      icon: '👥',
      preview: 'bar',
      category: 'Audience',
      examplePrompts: [
        'Show age distribution',
        'Compare demographics by platform',
        'Display gender breakdown',
      ],
    },
    {
      id: 'reach-impressions',
      title: 'Reach vs Impressions',
      description: 'Compare reach and impressions',
      chartType: 'Dual Line',
      icon: '🌐',
      preview: 'line',
      category: 'Performance',
      examplePrompts: [
        'Compare reach and impressions',
        'Show frequency trends',
        'Analyze reach expansion',
      ],
    },
  ];

  onClose(): void {
    this.close.emit();
  }

  selectTemplate(template: ChartTemplate): void {
    this.selectedTemplate = template;
    this.showChat = true;
    this.chatMessages = [];
    this.currentPreview = null;

    // Add welcome message
    this.chatMessages.push({
      role: 'assistant',
      content:
        template.id === 'custom'
          ? "Hi! I'm here to help you create a custom chart. Describe what you'd like to visualize and I'll create it for you."
          : `Great choice! I'll help you create a ${template.chartType} for ${template.title}. You can use one of the example prompts or describe your own customization.`,
      timestamp: new Date(),
    });
  }

  backToTemplates(): void {
    this.showChat = false;
    this.selectedTemplate = null;
    this.chatMessages = [];
    this.userMessage = '';
    this.currentPreview = null;
  }

  useExamplePrompt(prompt: string): void {
    this.userMessage = prompt;
    this.sendMessage();
  }

  handleEnterKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;

    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.sendMessage();
    }
    // If shift key is pressed, allow default behavior (new line)
  }

  sendMessage(): void {
    if (!this.userMessage.trim() || this.isGenerating) return;

    const userPrompt = this.userMessage;

    // Add user message
    this.chatMessages.push({
      role: 'user',
      content: userPrompt,
      timestamp: new Date(),
    });

    this.userMessage = '';
    this.isGenerating = true;

    // Simulate AI response with preview
    setTimeout(() => {
      const preview = {
        type: this.selectedTemplate?.preview || 'line',
        title: this.selectedTemplate?.title || 'Custom Chart',
        prompt: userPrompt,
      };

      this.chatMessages.push({
        role: 'assistant',
        content:
          "I've generated a preview based on your request. You can add it to your dashboard or request adjustments.",
        timestamp: new Date(),
        preview: preview,
      });

      this.isGenerating = false;
    }, 2000);
  }

  addToDashboard(): void {
    const firstUserMessage = this.chatMessages.find((m) => m.role === 'user');
    if (firstUserMessage) {
      this.generate.emit(firstUserMessage.content);
      this.onClose();
    }
  }

  addPreviewToDashboard(preview: any): void {
    this.generate.emit(preview.prompt);
    this.onClose();
  }

  getFilteredTemplates(): ChartTemplate[] {
    let filtered = this.templates;

    if (this.selectedCategory !== 'All') {
      filtered = filtered.filter(
        (t) => t.category === this.selectedCategory || t.category === 'All',
      );
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) => t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query),
      );
    }

    return filtered;
  }

  getPreviewSVG(type: string): string {
    const previews: { [key: string]: string } = {
      custom:
        'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
      line: 'M3 17l6-6 4 4 8-8M3 21h18',
      bar: 'M3 17v4m6-8v8m6-12v12m6-8v8',
      pie: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z',
      area: 'M7 12l3-9 3 9 3-4 3 4',
    };
    return previews[type] || previews['bar'];
  }
}
