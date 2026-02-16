import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-share-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './share-modal.component.html',
  styleUrls: ['./share-modal.component.css'],
})
export class ShareModalComponent {
  @Input() shareUrl: string = '';
  @Input() dashboardName: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() shareWithUser = new EventEmitter<{ email: string; permission: string }>();

  copied: boolean = false;
  showUserShare: boolean = false;
  userEmail: string = '';
  selectedPermission: string = 'view';

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

  toggleUserShare(): void {
    this.showUserShare = !this.showUserShare;
    if (!this.showUserShare) {
      this.userEmail = '';
      this.selectedPermission = 'view';
    }
  }

  onShareWithUser(): void {
    if (this.userEmail.trim()) {
      this.shareWithUser.emit({
        email: this.userEmail,
        permission: this.selectedPermission,
      });
      this.userEmail = '';
      this.selectedPermission = 'view';
      this.showUserShare = false;
    }
  }
}
