import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GridItem {
  id: string;
  type: 'summary' | 'count' | 'chart';
  title: string;
  content?: any;
  value?: number;
  label?: string;
  prompt?: string;
  chartData?: any;
  x: number; // Grid column start (0-11)
  y: number; // Grid row start
  w: number; // Width in columns (1-12)
  h: number; // Height in rows
}

@Component({
  selector: 'app-dashboard-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-grid.component.html',
  styleUrls: ['./dashboard-grid.component.css'],
})
export class DashboardGridComponent {
  @Input() items: GridItem[] = [];
  @Input() isEditMode: boolean = false;
  @Output() itemsChange = new EventEmitter<GridItem[]>();

  draggedItem: GridItem | null = null;
  resizingItem: GridItem | null = null;
  resizeHandle: string = '';
  startX: number = 0;
  startY: number = 0;
  startWidth: number = 0;
  startHeight: number = 0;

  onDragStart(item: GridItem, event: DragEvent): void {
    if (!this.isEditMode) {
      event.preventDefault();
      return;
    }
    this.draggedItem = item;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent): void {
    if (!this.isEditMode) return;
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    // Implement drop logic if needed
  }

  startResize(item: GridItem, handle: string, event: MouseEvent): void {
    if (!this.isEditMode) return;

    event.preventDefault();
    event.stopPropagation();

    this.resizingItem = item;
    this.resizeHandle = handle;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startWidth = item.w;
    this.startHeight = item.h;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.resizingItem || !this.isEditMode) return;

    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;

    // Each column is approximately 1/12 of container width
    // Each row is 100px (cellHeight)
    const colWidth = 80; // Approximate column width
    const rowHeight = 100;

    if (this.resizeHandle.includes('e')) {
      const newWidth = Math.max(1, Math.min(12, this.startWidth + Math.round(deltaX / colWidth)));
      this.resizingItem.w = newWidth;
    }
    if (this.resizeHandle.includes('w')) {
      const newWidth = Math.max(1, this.startWidth - Math.round(deltaX / colWidth));
      if (newWidth !== this.resizingItem.w) {
        const diff = this.resizingItem.w - newWidth;
        this.resizingItem.x = Math.max(0, Math.min(11, this.resizingItem.x + diff));
        this.resizingItem.w = newWidth;
      }
    }
    if (this.resizeHandle.includes('s')) {
      const newHeight = Math.max(1, Math.min(4, this.startHeight + Math.round(deltaY / rowHeight)));
      this.resizingItem.h = newHeight;
    }
    if (this.resizeHandle.includes('n')) {
      const newHeight = Math.max(1, this.startHeight - Math.round(deltaY / rowHeight));
      if (newHeight !== this.resizingItem.h) {
        const diff = this.resizingItem.h - newHeight;
        this.resizingItem.y = Math.max(0, this.resizingItem.y + diff);
        this.resizingItem.h = newHeight;
      }
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (this.resizingItem) {
      this.itemsChange.emit(this.items);
      this.resizingItem = null;
      this.resizeHandle = '';
    }
  }

  getGridStyle(item: GridItem): any {
    return {
      'grid-column-start': item.x + 1,
      'grid-column-end': item.x + item.w + 1,
      'grid-row-start': item.y + 1,
      'grid-row-end': item.y + item.h + 1,
    };
  }
}
