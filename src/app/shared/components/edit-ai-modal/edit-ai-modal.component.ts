import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GridItem } from '../dashboard-grid/dashboard-grid.component';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  preview?: any;
}

@Component({
  selector: 'app-edit-ai-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-ai-modal.component.html',
  styleUrls: ['./edit-ai-modal.component.css'],
})
export class EditAiModalComponent implements OnInit {
  @Input() widget!: GridItem;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<GridItem>();

  chatMessages: ChatMessage[] = [];
  userMessage: string = '';
  isGenerating: boolean = false;

  examplePrompts: string[] = [];

  ngOnInit(): void {
    // Set example prompts based on widget type
    if (this.widget.type === 'chart') {
      this.examplePrompts = [
        'Change to a bar chart',
        'Use blue and purple colors',
        'Show data for last 90 days',
        'Add trend line',
        'Change Y-axis to percentage',
        'Group by week instead of day',
      ];
    } else if (this.widget.type === 'count') {
      this.examplePrompts = [
        'Change the metric to show growth rate',
        'Add comparison with last month',
        'Show as percentage',
        'Include trend indicator',
      ];
    } else {
      this.examplePrompts = [
        'Make it more concise',
        'Add more details',
        'Focus on key metrics',
        'Include recommendations',
      ];
    }

    // Welcome message
    this.chatMessages.push({
      role: 'assistant',
      content: `I'll help you edit this ${this.widget.type}. What would you like to change?`,
      timestamp: new Date(),
    });
  }

  onClose(): void {
    this.close.emit();
  }

  useExamplePrompt(prompt: string): void {
    this.userMessage = prompt;
    this.sendMessage();
  }

  handleEnterKey(event: Event): void {
    const e = event as KeyboardEvent;

    if (!e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(): void {
    if (!this.userMessage.trim() || this.isGenerating) return;

    const userPrompt = this.userMessage;

    this.chatMessages.push({
      role: 'user',
      content: userPrompt,
      timestamp: new Date(),
    });

    this.userMessage = '';
    this.isGenerating = true;

    setTimeout(() => {
      const preview = {
        ...this.widget,
        title: this.widget.title + ' (Edited)',
        prompt: userPrompt,
      };

      this.chatMessages.push({
        role: 'assistant',
        content: "I've updated the widget based on your request. You can see the preview above.",
        timestamp: new Date(),
        preview: preview,
      });

      this.isGenerating = false;
    }, 2000);
  }

  applyChanges(preview: any): void {
    this.save.emit(preview);
    this.onClose();
  }
}
