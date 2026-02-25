import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoWidgetConfig } from '../../../../core/models/video-widget.model';
import { VideoFullscreenModalComponent } from '../../modals/video-fullscreen-modal/video-fullscreen-modal.component';
import { DEFAULT_VIDEO_CONFIG } from '../../../../core/data/video.mock.data';

@Component({
  selector: 'app-video-widget',
  standalone: true,
  imports: [CommonModule, VideoFullscreenModalComponent],
  templateUrl: './video-widget.component.html',
  styleUrls: ['./video-widget.component.css'],
})
export class VideoWidgetComponent {
  /** Accepts an optional config — falls back to mock data when undefined */
  @Input() config: VideoWidgetConfig | undefined;

  /** Always-resolved config the template binds to — never undefined */
  resolved: VideoWidgetConfig = DEFAULT_VIDEO_CONFIG;

  isModalOpen: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      this.resolved = this.config ?? DEFAULT_VIDEO_CONFIG;
    }
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  getTimeAgo(isoString: string): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 2592000)}mo ago`;
  }

  getSentimentColor(s?: string): string {
    if (s === 'positive') return '#10b981';
    if (s === 'negative') return '#ef4444';
    return '#94a3b8';
  }
}
