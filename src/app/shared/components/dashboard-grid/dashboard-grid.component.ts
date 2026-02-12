import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { DateRangePickerComponent } from '../date-range-picker/date-range-picker.component';

export interface GridItem {
  id: string;
  type: 'summary' | 'count' | 'chart';
  title: string;
  content?: any;
  value?: number;
  label?: string;
  prompt?: string;
  chartData?: any;
  colSpan: number;
  rowSpan: number;
}

@Component({
  selector: 'app-dashboard-grid',
  standalone: true,
  imports: [CommonModule, DragDropModule, DateRangePickerComponent],
  templateUrl: './dashboard-grid.component.html',
  styleUrls: ['./dashboard-grid.component.css'],
})
export class DashboardGridComponent {
  @Input() items: GridItem[] = [];
  @Input() isEditMode: boolean = false;
  @Output() itemsChange = new EventEmitter<GridItem[]>();
  @Output() itemDelete = new EventEmitter<string>();
  @Output() widgetClick = new EventEmitter<GridItem>();
  @Output() itemDuplicate = new EventEmitter<string>();
  @Output() chartDateRangeClick = new EventEmitter<{ chartId: string; range: any }>();
  @Output() editWithAI = new EventEmitter<GridItem>();

  resizingItem: GridItem | null = null;
  resizeDirection: string = '';
  startX: number = 0;
  startY: number = 0;
  startColSpan: number = 0;
  startRowSpan: number = 0;
  activeWidgetMenu: string | null = null;
  activeChartDateMenu: string | null = null;

  drop(event: CdkDragDrop<GridItem[]>): void {
    if (!this.isEditMode) return;
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
    this.itemsChange.emit(this.items);
  }

  deleteItem(itemId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.itemDelete.emit(itemId);
    this.activeWidgetMenu = null;
  }

  onResizeStart(item: GridItem, direction: string, event: MouseEvent): void {
    if (!this.isEditMode) return;

    event.preventDefault();
    event.stopPropagation();

    this.resizingItem = item;
    this.resizeDirection = direction;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startColSpan = item.colSpan;
    this.startRowSpan = item.rowSpan;

    document.body.style.cursor = this.getCursorStyle(direction);
  }

  onWidgetClick(item: GridItem): void {
    if (!this.isEditMode) {
      this.widgetClick.emit(item);
    }
  }

  onEditWithAI(itemId: string, event: MouseEvent): void {
    event.stopPropagation();
    const item = this.items.find((i) => i.id === itemId);
    if (item) {
      this.editWithAI.emit(item);
    }
  }

  duplicateItem(itemId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.itemDuplicate.emit(itemId);
  }

  toggleWidgetMenu(itemId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.activeWidgetMenu = this.activeWidgetMenu === itemId ? null : itemId;
  }

  toggleChartDateMenu(itemId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.activeChartDateMenu = this.activeChartDateMenu === itemId ? null : itemId;
  }

  onChartDateRangeSelected(chartId: string, range: any): void {
    this.chartDateRangeClick.emit({ chartId, range });
    this.activeChartDateMenu = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Close widget menu and date menu when clicking outside
    this.activeWidgetMenu = null;
    this.activeChartDateMenu = null;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.resizingItem || !this.isEditMode) return;

    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;

    const colWidth = 100;
    const rowHeight = 120;

    const colDelta = Math.round(deltaX / colWidth);
    const rowDelta = Math.round(deltaY / rowHeight);

    if (this.resizeDirection.includes('e')) {
      this.resizingItem.colSpan = Math.max(1, Math.min(12, this.startColSpan + colDelta));
    }
    if (this.resizeDirection.includes('s')) {
      this.resizingItem.rowSpan = Math.max(1, Math.min(6, this.startRowSpan + rowDelta));
    }
    if (this.resizeDirection.includes('w')) {
      this.resizingItem.colSpan = Math.max(1, Math.min(12, this.startColSpan - colDelta));
    }
    if (this.resizeDirection.includes('n')) {
      this.resizingItem.rowSpan = Math.max(1, Math.min(6, this.startRowSpan - rowDelta));
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (this.resizingItem) {
      this.itemsChange.emit(this.items);
      this.resizingItem = null;
      this.resizeDirection = '';
      document.body.style.cursor = 'default';
    }
  }

  getCursorStyle(direction: string): string {
    const cursors: { [key: string]: string } = {
      n: 'ns-resize',
      s: 'ns-resize',
      e: 'ew-resize',
      w: 'ew-resize',
      ne: 'nesw-resize',
      nw: 'nwse-resize',
      se: 'nwse-resize',
      sw: 'nesw-resize',
    };
    return cursors[direction] || 'default';
  }

  getGridColSpan(item: GridItem): string {
    return `span ${item.colSpan}`;
  }

  getGridRowSpan(item: GridItem): string {
    return `span ${item.rowSpan}`;
  }
}
