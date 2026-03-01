import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Dashboard } from '../../../../core/models/dashboard.model';
import { ShareModalComponent } from '../share-modal/share-modal.component';
import { ConfirmDeleteModalComponent } from '../confirm-delete-modal/confirm-delete-modal.component';
import { ToastService } from '../../../../core/services/toast.service';
import {
  DashboardIconService,
  DashboardIconOption,
} from '../../../../core/services/dashboard-icon.service';

@Component({
  selector: 'app-dashboard-menu-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ShareModalComponent,
    ConfirmDeleteModalComponent,
  ],
  templateUrl: './dashboard-menu-modal.component.html',
  styleUrls: ['./dashboard-menu-modal.component.css'],
})
export class DashboardMenuModalComponent implements OnInit {
  @Input() dashboard!: Dashboard;
  @Output() close = new EventEmitter<void>();
  @Output() rename = new EventEmitter<{ name: string; iconId: string }>();
  @Output() duplicate = new EventEmitter<void>();
  @Output() share = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  isRenaming: boolean = false;
  showShareModal: boolean = false;
  showDeleteModal: boolean = false;
  newName: string = '';
  selectedIconId: string = '';

  iconOptions: DashboardIconOption[] = [];
  selectedCategory: string = 'All';
  categories: string[] = ['All', 'Analytics', 'Social', 'Business', 'Technology'];

  constructor(
    private toastService: ToastService,
    public dashboardIconService: DashboardIconService,
  ) {}

  ngOnInit(): void {
    this.newName = this.dashboard.name;
    this.selectedIconId = this.dashboard.iconId || this.dashboardIconService.getDefaultIconId();
    this.iconOptions = this.dashboardIconService.getIconOptions();
  }

  getFilteredIcons(): DashboardIconOption[] {
    if (this.selectedCategory === 'All') {
      return this.iconOptions;
    }
    return this.iconOptions.filter((opt) => opt.category === this.selectedCategory);
  }

  onClose(): void {
    this.close.emit();
  }

  startRename(): void {
    this.isRenaming = true;
  }

  saveRename(): void {
    if (this.newName.trim()) {
      this.rename.emit({ name: this.newName, iconId: this.selectedIconId });
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
