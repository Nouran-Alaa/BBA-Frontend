import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsArticle } from '../../../../core/models/news-widget.model';

type NewsTab = 'article' | 'storytelling' | 'readscreen';

@Component({
  selector: 'app-news-fullscreen-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './news-fullscreen-modal.component.html',
  styleUrls: ['./news-fullscreen-modal.component.css'],
})
export class NewsFullscreenModalComponent {
  @Input() article!: NewsArticle;
  @Output() close = new EventEmitter<void>();

  activeTab: NewsTab = 'article';

  tabs: { key: NewsTab; label: string; icon: string }[] = [
    { key: 'article',      label: 'Article',      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { key: 'storytelling', label: 'Storytelling',  icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { key: 'readscreen',   label: 'Read Screen',   icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  ];

  onClose(): void { this.close.emit(); }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void { this.onClose(); }

  getTimeAgo(isoString: string): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  getSentimentColor(s?: string): string {
    if (s === 'positive') return '#10b981';
    if (s === 'negative') return '#ef4444';
    return '#94a3b8';
  }

  getSentimentLabel(s?: string): string {
    if (s === 'positive') return '▲ Positive';
    if (s === 'negative') return '▼ Negative';
    return '● Neutral';
  }

  formatEngagement(n?: number): string {
    if (!n) return '';
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K engagements`;
    return `${n} engagements`;
  }

  // Storytelling: paragraph-ise the full content for the storytelling tab
  getStorytellingText(): string {
    return this.article.fullContent ||
      `This article from ${this.article.sourceName} explores ${this.article.title}. ` +
      this.article.summary;
  }

  // Simulated reading stats for Read Screen tab
  getReadingTime(): string {
    const words = ((this.article.fullContent || '') + this.article.summary).split(' ').length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  }
}
