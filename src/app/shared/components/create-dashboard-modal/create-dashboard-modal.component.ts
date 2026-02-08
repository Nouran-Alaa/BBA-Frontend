import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-dashboard-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-dashboard-modal.component.html',
  styleUrls: ['./create-dashboard-modal.component.css'],
})
export class CreateDashboardModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<{ name: string; description: string; icon: string }>();

  dashboardName: string = '';
  dashboardDescription: string = '';
  selectedIcon: string = '📊';

  icons: string[] = ['📊', '📈', '📉', '💼', '🎯', '📱', '💻', '🌐', '📺', '📸', '🎬', '🎮'];

  onClose(): void {
    this.close.emit();
  }

  onCreate(): void {
    if (this.dashboardName.trim()) {
      this.create.emit({
        name: this.dashboardName,
        description: this.dashboardDescription,
        icon: this.selectedIcon,
      });
    }
  }

  selectIcon(icon: string): void {
    this.selectedIcon = icon;
  }
}
