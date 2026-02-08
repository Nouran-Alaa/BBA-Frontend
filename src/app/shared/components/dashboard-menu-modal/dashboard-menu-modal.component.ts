import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Dashboard } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard-menu-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-menu-modal.component.html',
  styleUrls: ['./dashboard-menu-modal.component.css'],
})
export class DashboardMenuModalComponent {
  @Input() dashboard!: Dashboard;
  @Output() close = new EventEmitter<void>();
  @Output() rename = new EventEmitter<{ name: string; icon: string }>();
  @Output() duplicate = new EventEmitter<void>();
  @Output() share = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  isRenaming: boolean = false;
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
    this.share.emit();
  }

  onDelete(): void {
    if (confirm(`Are you sure you want to delete "${this.dashboard.name}"?`)) {
      this.delete.emit();
      this.onClose();
    }
  }
}
