import { Component, Input, Output, EventEmitter, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VideoWidgetConfig, VideoTag } from '../../../../core/models/video-widget.model';
import { TrustUrlPipe } from '../../../pipes/trust-url.pipe';

export type VideoTab =
  | 'player'
  | 'transcription'
  | 'tags'
  | 'comments'
  | 'report'
  | 'analyzer'
  | 'storytelling';

interface TagGroup {
  category: string;
  subGroups: { subCategory: string; tags: VideoTag[] }[];
}

@Component({
  selector: 'app-video-fullscreen-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TrustUrlPipe],
  templateUrl: './video-fullscreen-modal.component.html',
  styleUrls: ['./video-fullscreen-modal.component.css'],
})
export class VideoFullscreenModalComponent implements OnInit {
  @Input() config!: VideoWidgetConfig;
  @Output() close = new EventEmitter<void>();

  activeTab: VideoTab = 'player';
  showTranscriptOnVideo: boolean = false;

  tabs: { key: VideoTab; label: string; icon: string }[] = [
    {
      key: 'player',
      label: 'Video',
      icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      key: 'transcription',
      label: 'Transcription',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      key: 'tags',
      label: 'Tags & Keywords',
      icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    },
    {
      key: 'comments',
      label: 'Comments',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    },
    {
      key: 'report',
      label: 'Report',
      icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      key: 'analyzer',
      label: 'Analyzer',
      icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
    {
      key: 'storytelling',
      label: 'Storytelling',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    },
  ];

  groupedTags: TagGroup[] = [];

  ngOnInit(): void {
    this.buildTagGroups();
  }

  private buildTagGroups(): void {
    if (!this.config.tags) return;
    const map = new Map<string, Map<string, VideoTag[]>>();
    for (const tag of this.config.tags) {
      if (!map.has(tag.category)) map.set(tag.category, new Map());
      const sub = tag.subCategory || 'General';
      const catMap = map.get(tag.category)!;
      if (!catMap.has(sub)) catMap.set(sub, []);
      catMap.get(sub)!.push(tag);
    }
    this.groupedTags = [];
    map.forEach((subMap, category) => {
      const subGroups: { subCategory: string; tags: VideoTag[] }[] = [];
      subMap.forEach((tags, subCategory) => subGroups.push({ subCategory, tags }));
      this.groupedTags.push({ category, subGroups });
    });
  }

  onClose(): void {
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.onClose();
  }

  getSentimentColor(s?: string): string {
    if (s === 'positive') return '#10b981';
    if (s === 'negative') return '#ef4444';
    return '#94a3b8';
  }

  getSentimentLabel(s?: string): string {
    if (s === 'positive') return 'Positive';
    if (s === 'negative') return 'Negative';
    return 'Neutral';
  }

  formatCount(n?: number): string {
    if (!n) return '0';
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return `${n}`;
  }

  getTimeAgo(isoString: string): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(isoString).getTime()) / 1000);
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getBarWidth(pct: number): string {
    return `${pct}%`;
  }

  /**
   * Returns a CSS color for each tag category.
   * Chosen to look good on both light and dark themes.
   */
  getCategoryColor(category: string): string {
    const palette: Record<string, string> = {
      'Public Figures': '#3b82f6', // blue-500
      Places: '#10b981', // emerald-500
      Entities: '#8b5cf6', // violet-500
      Organizations: '#f59e0b', // amber-500
      Events: '#ef4444', // red-500
      Products: '#06b6d4', // cyan-500
      Topics: '#f97316', // orange-500
      Brands: '#ec4899', // pink-500
      People: '#3b82f6',
      Locations: '#10b981',
      Keywords: '#64748b', // slate-500
    };
    // Deterministic fallback based on category name hash
    const fallbacks = [
      '#3b82f6',
      '#10b981',
      '#8b5cf6',
      '#f59e0b',
      '#ef4444',
      '#06b6d4',
      '#f97316',
      '#ec4899',
    ];
    if (palette[category]) return palette[category];
    let hash = 0;
    for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) & 0xffff;
    return fallbacks[hash % fallbacks.length];
  }
}
