import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ai-chat-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat-modal.component.html',
  styleUrls: ['./ai-chat-modal.component.css'],
})
export class AiChatModalComponent {
  @Input() isGenerating: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() generate = new EventEmitter<string>();

  userPrompt: string = '';

  // Example prompts
  examplePrompts: string[] = [
    'Show me Facebook post engagement over the last 30 days',
    'Create a bar chart of YouTube video views by month',
    'Display Instagram reach vs impressions comparison',
    'Generate a pie chart of social media followers by platform',
  ];

  onClose(): void {
    this.close.emit();
  }

  onGenerate(): void {
    if (this.userPrompt.trim()) {
      this.generate.emit(this.userPrompt);
    }
  }

  useExamplePrompt(prompt: string): void {
    this.userPrompt = prompt;
  }
}
