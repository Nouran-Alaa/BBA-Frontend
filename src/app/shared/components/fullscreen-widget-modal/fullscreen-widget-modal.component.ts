import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridItem } from '../dashboard-grid/dashboard-grid.component';

@Component({
  selector: 'app-fullscreen-widget-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fullscreen-widget-modal.component.html',
  styleUrls: ['./fullscreen-widget-modal.component.css'],
})
export class FullscreenWidgetModalComponent {
  @Input() widget!: GridItem;
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.onClose();
  }
}
