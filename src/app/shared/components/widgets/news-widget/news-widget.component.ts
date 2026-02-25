import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsWidgetConfig, NewsArticle } from '../../../../core/models/news-widget.model';
import { NewsFullscreenModalComponent } from '../../modals/news-fullscreen-modal/news-fullscreen-modal.component';
import { DEFAULT_NEWS_CONFIG } from '../../../../core/data/news.mock.data';

@Component({
  selector: 'app-news-widget',
  standalone: true,
  imports: [CommonModule, NewsFullscreenModalComponent],
  templateUrl: './news-widget.component.html',
  styleUrls: ['./news-widget.component.css'],
})
export class NewsWidgetComponent implements OnChanges {
  /** Optional config — falls back to mock data when undefined */
  @Input() config: NewsWidgetConfig | undefined;

  /** Always-resolved config the template binds to */
  resolved: NewsWidgetConfig = DEFAULT_NEWS_CONFIG;

  selectedArticle: NewsArticle | null = null;
  visibleCount = 6;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      this.resolved = this.config ?? DEFAULT_NEWS_CONFIG;
    }
  }

  get visibleArticles(): NewsArticle[] {
    return this.resolved.articles.slice(0, this.visibleCount);
  }

  get hasMore(): boolean {
    return this.resolved.articles.length > this.visibleCount;
  }

  loadMore(): void {
    this.visibleCount += 3;
  }

  openArticle(article: NewsArticle): void {
    this.selectedArticle = article;
  }
  closeModal(): void {
    this.selectedArticle = null;
  }

  getTimeAgo(isoString: string): string {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
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

  /** Stop the click from bubbling to the card (which opens the article) */
  onSourceClick(event: MouseEvent): void {
    event.stopPropagation();
  }
}
