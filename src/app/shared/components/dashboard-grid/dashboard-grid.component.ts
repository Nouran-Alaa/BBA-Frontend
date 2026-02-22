import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, CdkDragMove, DragDropModule } from '@angular/cdk/drag-drop';
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
  colStart?: number;
  rowStart?: number;
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
  startColStart: number = 0;
  startRowStart: number = 0;
  activeWidgetMenu: string | null = null;
  activeChartDateMenu: string | null = null;
  datePickerPosition: { top: number; left: number } = { top: 0, left: 0 };

  draggingItem: GridItem | null = null;
  originalPosition: { col: number; row: number } | null = null;

  ngOnInit() {
    this.initializeLayout();
  }

  ngOnChanges() {
    this.initializeLayout();
  }

  initializeLayout() {
    if (this.items.length === 0) return;

    // Ensure all items have positions
    this.items.forEach((item) => {
      if (item.colStart === undefined) item.colStart = 0;
      if (item.rowStart === undefined) item.rowStart = 0;
    });

    // Compact the grid
    this.compactGrid();
  }

  compactGrid() {
    // Sort by row then column
    this.items.sort((a, b) => {
      const rowDiff = (a.rowStart ?? 0) - (b.rowStart ?? 0);
      if (rowDiff !== 0) return rowDiff;
      return (a.colStart ?? 0) - (b.colStart ?? 0);
    });

    // Move each item up as far as possible
    this.items.forEach((item) => {
      let bestRow = item.rowStart ?? 0;

      // Try each row from 0 upward
      for (let testRow = 0; testRow < bestRow; testRow++) {
        const testItem = { ...item, rowStart: testRow };

        // Check if this position is free
        const hasCollision = this.items.some(
          (other) => other.id !== item.id && this.isColliding(testItem, other),
        );

        if (!hasCollision) {
          bestRow = testRow;
          break;
        }
      }

      item.rowStart = bestRow;
    });
  }

  onDragStarted(event: any) {
    this.draggingItem = event.source.data;
    this.originalPosition = {
      col: this.draggingItem?.colStart ?? 0,
      row: this.draggingItem?.rowStart ?? 0,
    };

    // Make the original item semi-transparent during drag
    event.source.element.nativeElement.style.opacity = '0.4';
  }

  onDragEnded() {
    if (this.draggingItem) {
      // Restore opacity
      const draggedElements = document.querySelectorAll('[cdkDrag]');
      draggedElements.forEach((el: any) => {
        el.style.opacity = '1';
      });
    }

    this.draggingItem = null;
    this.originalPosition = null;
  }

  onDragMoved(event: CdkDragMove) {
    if (!this.draggingItem) return;

    const container = event.source.dropContainer.element.nativeElement;
    const rect = container.getBoundingClientRect();

    const x = event.pointerPosition.x - rect.left;
    const y = event.pointerPosition.y - rect.top;

    const colWidth = rect.width / 12;
    const rowHeight = 120;

    const col = Math.max(0, Math.min(12 - this.draggingItem.colSpan, Math.floor(x / colWidth)));
    const row = Math.max(0, Math.floor(y / rowHeight));

    // Temporarily update position to show live feedback
    this.draggingItem.colStart = col;
    this.draggingItem.rowStart = row;
  }

  drop(event: CdkDragDrop<any>) {
    const item = event.item.data as GridItem;
    const container = event.container.element.nativeElement;
    const rect = container.getBoundingClientRect();

    const x = event.dropPoint.x - rect.left;
    const y = event.dropPoint.y - rect.top;

    const colWidth = rect.width / 12;
    const rowHeight = 120;

    const targetCol = Math.max(0, Math.min(12 - item.colSpan, Math.floor(x / colWidth)));
    const targetRow = Math.max(0, Math.floor(y / rowHeight));

    // Set new position
    item.colStart = targetCol;
    item.rowStart = targetRow;

    // Find items that collide with the dropped item
    const collidingItems = this.items.filter(
      (other) => other.id !== item.id && this.isColliding(item, other),
    );

    // Push colliding items down
    collidingItems.forEach((colliding) => {
      const itemBottom = (item.rowStart ?? 0) + item.rowSpan;
      colliding.rowStart = itemBottom;
    });

    // Recursively fix any new collisions
    this.fixAllCollisions(item);

    // Compact the grid to remove gaps
    this.compactGrid();

    this.itemsChange.emit(this.items);
    this.onDragEnded();
  }

  fixAllCollisions(movedItem: GridItem) {
    let hasCollisions = true;
    let iterations = 0;
    const maxIterations = 100; // Prevent infinite loops

    while (hasCollisions && iterations < maxIterations) {
      hasCollisions = false;
      iterations++;

      for (let i = 0; i < this.items.length; i++) {
        for (let j = i + 1; j < this.items.length; j++) {
          if (this.isColliding(this.items[i], this.items[j])) {
            // Move the item with higher row down
            const itemToMove =
              (this.items[i].rowStart ?? 0) > (this.items[j].rowStart ?? 0)
                ? this.items[i]
                : this.items[j];

            const otherItem = itemToMove === this.items[i] ? this.items[j] : this.items[i];
            const otherBottom = (otherItem.rowStart ?? 0) + otherItem.rowSpan;

            itemToMove.rowStart = otherBottom;
            hasCollisions = true;
          }
        }
      }
    }
  }

  isColliding(a: GridItem, b: GridItem): boolean {
    const aCol = a.colStart ?? 0;
    const bCol = b.colStart ?? 0;
    const aRow = a.rowStart ?? 0;
    const bRow = b.rowStart ?? 0;

    return !(
      aCol + a.colSpan <= bCol ||
      aCol >= bCol + b.colSpan ||
      aRow + a.rowSpan <= bRow ||
      aRow >= bRow + b.rowSpan
    );
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
    this.startColStart = item.colStart ?? 0;
    this.startRowStart = item.rowStart ?? 0;

    document.body.style.userSelect = 'none';
    document.body.style.cursor = this.getCursorStyle(direction);
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

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.resizingItem || !this.isEditMode) return;

    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;

    const grid = document.querySelector('[cdkDropList]') as HTMLElement;
    if (!grid) return;

    const gridWidth = grid.clientWidth;
    const colWidth = gridWidth / 12;
    const rowHeight = 120;

    const colDelta = Math.round(deltaX / colWidth);
    const rowDelta = Math.round(deltaY / rowHeight);

    if (this.resizeDirection.includes('e')) {
      const maxColSpan = 12 - this.startColStart;
      this.resizingItem.colSpan = Math.max(1, Math.min(maxColSpan, this.startColSpan + colDelta));
    }
    if (this.resizeDirection.includes('s')) {
      this.resizingItem.rowSpan = Math.max(1, Math.min(6, this.startRowSpan + rowDelta));
    }
    if (this.resizeDirection.includes('w')) {
      const newColSpan = Math.max(1, Math.min(12, this.startColSpan - colDelta));
      const colChange = this.startColSpan - newColSpan;
      this.resizingItem.colSpan = newColSpan;
      this.resizingItem.colStart = Math.max(0, this.startColStart + colChange);
    }
    if (this.resizeDirection.includes('n')) {
      const newRowSpan = Math.max(1, Math.min(6, this.startRowSpan - rowDelta));
      const rowChange = this.startRowSpan - newRowSpan;
      this.resizingItem.rowSpan = newRowSpan;
      this.resizingItem.rowStart = Math.max(0, this.startRowStart + rowChange);
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (this.resizingItem) {
      // Fix collisions caused by resize
      this.fixAllCollisions(this.resizingItem);
      this.compactGrid();
      this.itemsChange.emit(this.items);
      this.resizingItem = null;
      this.resizeDirection = '';
      document.body.style.cursor = 'default';
      document.body.style.userSelect = '';
    }
  }

  toggleWidgetMenu(itemId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.activeWidgetMenu = this.activeWidgetMenu === itemId ? null : itemId;
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

  toggleChartDateMenu(itemId: string, event: MouseEvent): void {
    event.stopPropagation();

    if (this.activeChartDateMenu === itemId) {
      this.activeChartDateMenu = null;
      return;
    }

    this.activeChartDateMenu = itemId;

    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();

    const datePickerWidth = 280;
    const datePickerHeight = 420;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 12;

    let top: number;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow >= datePickerHeight + margin) {
      top = rect.bottom + margin;
    } else if (spaceAbove >= datePickerHeight + margin) {
      top = rect.top - datePickerHeight - margin;
    } else {
      top = Math.max(margin, (viewportHeight - datePickerHeight) / 2);
    }

    let left: number;
    const idealLeft = rect.right - datePickerWidth;

    if (idealLeft < margin) {
      left = rect.left;
    } else if (idealLeft + datePickerWidth > viewportWidth - margin) {
      left = viewportWidth - datePickerWidth - margin;
    } else {
      left = idealLeft;
    }

    this.datePickerPosition = { top, left };
  }

  onChartDateRangeSelected(chartId: string, range: any): void {
    this.chartDateRangeClick.emit({ chartId, range });
    this.activeChartDateMenu = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.activeWidgetMenu = null;
    this.activeChartDateMenu = null;
  }
}
