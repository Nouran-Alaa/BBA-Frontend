import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-share-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './share-modal.component.html',
  styleUrls: ['./share-modal.component.css'],
})
export class ShareModalComponent {
  @Input() shareUrl: string = '';
  @Input() dashboardName: string = '';
  @Output() close = new EventEmitter<void>();

  copied: boolean = false;

  onClose(): void {
    this.close.emit();
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.shareUrl).then(() => {
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    });
  }
}
