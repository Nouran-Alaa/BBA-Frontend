import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ComponentRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoWidgetConfig } from '../../../../core/models/video-widget.model';
import { VideoFullscreenModalComponent } from '../../modals/video-fullscreen-modal/video-fullscreen-modal.component';
import { DEFAULT_VIDEO_CONFIG } from '../../../../core/data/video.mock.data';
import { ModalPortalService } from '../../../../core/services/modal-portal.service';

@Component({
  selector: 'app-video-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-widget.component.html',
  styleUrls: ['./video-widget.component.css'],
})
export class VideoWidgetComponent implements OnChanges, OnDestroy {
  /** Accepts an optional config — falls back to mock data when undefined */
  @Input() config: VideoWidgetConfig | undefined;

  /** Always-resolved config the template binds to — never undefined */
  resolved: VideoWidgetConfig = DEFAULT_VIDEO_CONFIG;

  private modalRef?: ComponentRef<VideoFullscreenModalComponent>;

  constructor(private modalPortal: ModalPortalService) {}

  isModalOpen: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      this.resolved = this.config ?? DEFAULT_VIDEO_CONFIG;
    }
  }

  ngOnDestroy(): void {
    this.closeModal();
  }

  openModal(): void {
    this.closeModal();
    // Open at document.body — bypasses CDK drag / overflow:hidden stacking contexts
    this.modalRef = this.modalPortal.open(VideoFullscreenModalComponent, { config: this.resolved });
    this.modalRef.instance.close.subscribe(() => this.closeModal());
  }

  closeModal(): void {
    if (this.modalRef) {
      this.modalPortal.close(this.modalRef);
      this.modalRef = undefined;
    }
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
