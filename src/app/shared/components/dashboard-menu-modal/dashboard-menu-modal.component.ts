import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dashboard } from '../../../core/models/dashboard.model';
import { ShareModalComponent } from '../share-modal/share-modal.component';
import { ConfirmDeleteModalComponent } from '../confirm-delete-modal/confirm-delete-modal.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-dashboard-menu-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ShareModalComponent, ConfirmDeleteModalComponent],
  templateUrl: './dashboard-menu-modal.component.html',
  styleUrls: ['./dashboard-menu-modal.component.css'],
})
export class DashboardMenuModalComponent implements OnInit {
  @Input() dashboard!: Dashboard;
  @Output() close = new EventEmitter<void>();
  @Output() rename = new EventEmitter<{ name: string; icon: string }>();
  @Output() duplicate = new EventEmitter<void>();
  @Output() share = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  isRenaming: boolean = false;
  showShareModal: boolean = false;
  showDeleteModal: boolean = false;
  newName: string = '';
  selectedIcon: string = '';

  icons: string[] = [
    '📊',
    '📈',
    '📉',
    '💼',
    '🎯',
    '📱',
    '💻',
    '🌐',
    '📺',
    '📸',
    '🎬',
    '🎮',
    '📘',
    '📗',
    '📙',
    '📕',
  ];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.newName = this.dashboard.name;
    this.selectedIcon = this.dashboard.icon || '📊';
  }

  onClose(): void {
    this.close.emit();
  }

  startRename(): void {
    this.isRenaming = true;
  }

  saveRename(): void {
    if (this.newName.trim()) {
      this.rename.emit({ name: this.newName, icon: this.selectedIcon });
      this.isRenaming = false;
    }
  }

  onDuplicate(): void {
    this.duplicate.emit();
    this.onClose();
  }

  onShare(): void {
    this.showShareModal = true;
  }

  onShareWithUser(data: { email: string; permission: string }): void {
    console.log('Sharing dashboard with user:', data);
    // TODO: Implement backend API call to share dashboard
    this.toastService.success(`Dashboard shared with ${data.email}`);
  }

  onShareClose(): void {
    this.showShareModal = false;
    this.share.emit();
    this.onClose();
  }

  onDelete(): void {
    this.showDeleteModal = true;
  }

  onDeleteConfirm(): void {
    this.delete.emit();
    this.showDeleteModal = false;
    this.onClose();
  }

  onDeleteCancel(): void {
    this.showDeleteModal = false;
  }

  getShareUrl(): string {
    return `${window.location.origin}/dashboard/${this.dashboard.id}`;
  }
}
