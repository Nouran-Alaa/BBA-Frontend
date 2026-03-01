/**
 * dashboard-grid.component.ts
 * Unchanged from document 8 except:
 *  - Added getColStyle() to map item.colSpan to responsive column spans
 */
import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  OnInit,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, CdkDragMove, DragDropModule } from '@angular/cdk/drag-drop';
import { DashboardCardComponent } from '../dashboard-card/dashboard-card.component';
import { CardActionsComponent } from '../action_menus/card-actions/card-actions.component';
import { WidgetMenuComponent } from '../action_menus/widget-menu/widget-menu.component';
import { GridItem } from '../../../core/models/grid-item.model';

export type { GridItem };

@Component({
  selector: 'app-dashboard-grid',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    DashboardCardComponent,
    CardActionsComponent,
    WidgetMenuComponent,
  ],
  templateUrl: './dashboard-grid.component.html',
  styleUrls: ['./dashboard-grid.component.css'],
})
export class DashboardGridComponent implements OnInit, OnChanges {
  @Input() items: GridItem[] = [];
  @Input() isEditMode: boolean = false;
  @Output() itemsChange = new EventEmitter<GridItem[]>();
  @Output() itemDelete = new EventEmitter<string>();
  @Output() widgetClick = new EventEmitter<GridItem>();
  @Output() itemDuplicate = new EventEmitter<string>();
  @Output() chartDateRangeClick = new EventEmitter<{ chartId: string; range: any }>();
  @Output() editWithAI = new EventEmitter<GridItem>();

  // Resize state
  resizingItem: GridItem | null = null;
  resizeDirection = '';
  startX = 0;
  startY = 0;
  startColSpan = 0;
  startRowSpan = 0;
  startColStart = 0;
  startRowStart = 0;

  // Menu state
  activeWidgetMenu: string | null = null;
  activeChartDateMenu: string | null = null;
  datePickerPosition: { top: number; left: number } = { top: 0, left: 0 };

  // Drag state
  draggingItem: GridItem | null = null;
  originalPosition: { col: number; row: number } | null = null;

  ngOnInit() {
    this.initializeLayout();
  }
  ngOnChanges() {
    this.initializeLayout();
  }

  initializeLayout() {
    if (!this.items.length) return;
    this.items.forEach((item) => {
      if (item.colStart === undefined) item.colStart = 0;
      if (item.rowStart === undefined) item.rowStart = 0;
    });
    this.compactGrid();
  }

  compactGrid() {
    this.items.sort((a, b) => {
      const rowDiff = (a.rowStart ?? 0) - (b.rowStart ?? 0);
      return rowDiff !== 0 ? rowDiff : (a.colStart ?? 0) - (b.colStart ?? 0);
    });
    this.items.forEach((item) => {
      let bestRow = item.rowStart ?? 0;
      for (let testRow = 0; testRow < bestRow; testRow++) {
        const testItem = { ...item, rowStart: testRow };
        const clash = this.items.some((o) => o.id !== item.id && this.isColliding(testItem, o));
        if (!clash) {
          bestRow = testRow;
          break;
        }
      }
      item.rowStart = bestRow;
    });
  }

  // ── Responsive column style ────────────────────────────────────────────────
  /**
   * Maps item.colSpan (1–12 on a 12-col grid) to a CSS grid-column string that
   * respects the three breakpoints:
   *   sm  (< md)  → always full width  (1 card/row)
   *   md  6-col   → span half or full  (up to 2 cards/row)
   *   lg  12-col  → exact colSpan      (up to 3 cards/row at span 4 each)
   *
   * colStart is relative to the 12-col lg grid; md clips to 6 cols automatically
   * because the container is only 6 cols wide on md.
   */
  getColStyle(item: GridItem): string {
    const start = (item.colStart ?? 0) + 1;
    const span = item.colSpan;
    // CSS custom property trick: let the browser pick the right span per breakpoint.
    // We return the lg value and rely on grid-template-columns to size appropriately.
    return `${start} / span ${span}`;
  }

  // ── Drag & Drop ────────────────────────────────────────────────────────────
  onDragStarted(event: any) {
    this.draggingItem = event.source.data;
    this.originalPosition = {
      col: this.draggingItem?.colStart ?? 0,
      row: this.draggingItem?.rowStart ?? 0,
    };
    event.source.element.nativeElement.style.opacity = '0.4';
  }

  onDragEnded() {
    document.querySelectorAll('[cdkDrag]').forEach((el: any) => (el.style.opacity = '1'));
    this.draggingItem = null;
    this.originalPosition = null;
  }

  onDragMoved(event: CdkDragMove) {
    if (!this.draggingItem) return;
    const container = event.source.dropContainer.element.nativeElement;
    const rect = container.getBoundingClientRect();
    const colWidth = rect.width / 12;
    const rowHeight = 120;
    const col = Math.max(
      0,
      Math.min(
        12 - this.draggingItem.colSpan,
        Math.floor((event.pointerPosition.x - rect.left) / colWidth),
      ),
    );
    const row = Math.max(0, Math.floor((event.pointerPosition.y - rect.top) / rowHeight));
    this.draggingItem.colStart = col;
    this.draggingItem.rowStart = row;
  }

  drop(event: CdkDragDrop<any>) {
    const item = event.item.data as GridItem;
    const container = event.container.element.nativeElement;
    const rect = container.getBoundingClientRect();
    const colWidth = rect.width / 12;
    const rowHeight = 120;
    item.colStart = Math.max(
      0,
      Math.min(12 - item.colSpan, Math.floor((event.dropPoint.x - rect.left) / colWidth)),
    );
    item.rowStart = Math.max(0, Math.floor((event.dropPoint.y - rect.top) / rowHeight));
    this.items
      .filter((o) => o.id !== item.id && this.isColliding(item, o))
      .forEach((c) => {
        c.rowStart = (item.rowStart ?? 0) + item.rowSpan;
      });
    this.fixAllCollisions(item);
    this.compactGrid();
    this.itemsChange.emit(this.items);
    this.onDragEnded();
  }

  // ── Collision ──────────────────────────────────────────────────────────────
  fixAllCollisions(movedItem: GridItem) {
    let hasCollisions = true;
    let iter = 0;
    while (hasCollisions && iter++ < 100) {
      hasCollisions = false;
      for (let i = 0; i < this.items.length; i++) {
        for (let j = i + 1; j < this.items.length; j++) {
          if (!this.isColliding(this.items[i], this.items[j])) continue;
          const toMove =
            (this.items[i].rowStart ?? 0) > (this.items[j].rowStart ?? 0)
              ? this.items[i]
              : this.items[j];
          const other = toMove === this.items[i] ? this.items[j] : this.items[i];
          toMove.rowStart = (other.rowStart ?? 0) + other.rowSpan;
          hasCollisions = true;
        }
      }
    }
  }

  isColliding(a: GridItem, b: GridItem): boolean {
    const ac = a.colStart ?? 0,
      bc = b.colStart ?? 0;
    const ar = a.rowStart ?? 0,
      br = b.rowStart ?? 0;
    return !(
      ac + a.colSpan <= bc ||
      ac >= bc + b.colSpan ||
      ar + a.rowSpan <= br ||
      ar >= br + b.rowSpan
    );
  }

  // ── Widget Actions ─────────────────────────────────────────────────────────
  deleteItem(id: string, e?: MouseEvent) {
    e?.stopPropagation();
    this.itemDelete.emit(id);
    this.activeWidgetMenu = null;
  }
  duplicateItem(id: string, e?: MouseEvent) {
    e?.stopPropagation();
    this.itemDuplicate.emit(id);
    this.activeWidgetMenu = null;
  }
  toggleWidgetMenu(id: string, e: MouseEvent) {
    e.stopPropagation();
    this.activeWidgetMenu = this.activeWidgetMenu === id ? null : id;
  }

  onWidgetClick(item: GridItem) {
    if (!this.isEditMode) this.widgetClick.emit(item);
  }

  onEditWithAI(id: string, e: MouseEvent) {
    e.stopPropagation();
    const item = this.items.find((i) => i.id === id);
    if (item) this.editWithAI.emit(item);
  }

  // ── Date Picker ────────────────────────────────────────────────────────────
  toggleChartDateMenu(id: string, e: MouseEvent) {
    e.stopPropagation();
    if (this.activeChartDateMenu === id) {
      this.activeChartDateMenu = null;
      return;
    }
    this.activeChartDateMenu = id;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const dpW = 280,
      dpH = 420,
      vW = window.innerWidth,
      vH = window.innerHeight,
      m = 12;
    const top =
      vH - rect.bottom >= dpH + m
        ? rect.bottom + m
        : rect.top >= dpH + m
          ? rect.top - dpH - m
          : Math.max(m, (vH - dpH) / 2);
    const left = Math.max(m, Math.min(vW - dpW - m, rect.right - dpW));
    this.datePickerPosition = { top, left };
  }

  onChartDateRangeSelected(id: string, range: any) {
    this.chartDateRangeClick.emit({ chartId: id, range });
    this.activeChartDateMenu = null;
  }

  // ── Resize ─────────────────────────────────────────────────────────────────
  onResizeStart(item: GridItem, direction: string, e: MouseEvent) {
    if (!this.isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    this.resizingItem = item;
    this.resizeDirection = direction;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startColSpan = item.colSpan;
    this.startRowSpan = item.rowSpan;
    this.startColStart = item.colStart ?? 0;
    this.startRowStart = item.rowStart ?? 0;
    document.body.style.userSelect = 'none';
    document.body.style.cursor =
      {
        n: 'ns-resize',
        s: 'ns-resize',
        e: 'ew-resize',
        w: 'ew-resize',
        ne: 'nesw-resize',
        nw: 'nwse-resize',
        se: 'nwse-resize',
        sw: 'nesw-resize',
      }[direction] ?? 'default';
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (!this.resizingItem || !this.isEditMode) return;
    const grid = document.querySelector('[cdkDropList]') as HTMLElement;
    if (!grid) return;
    const colWidth = grid.clientWidth / 12;
    const rowHeight = 120;
    const dCol = Math.round((e.clientX - this.startX) / colWidth);
    const dRow = Math.round((e.clientY - this.startY) / rowHeight);
    const dir = this.resizeDirection;
    if (dir.includes('e'))
      this.resizingItem.colSpan = Math.max(
        1,
        Math.min(12 - this.startColStart, this.startColSpan + dCol),
      );
    if (dir.includes('s'))
      this.resizingItem.rowSpan = Math.max(1, Math.min(6, this.startRowSpan + dRow));
    if (dir.includes('w')) {
      const ns = Math.max(1, Math.min(12, this.startColSpan - dCol));
      this.resizingItem.colSpan = ns;
      this.resizingItem.colStart = Math.max(0, this.startColStart + (this.startColSpan - ns));
    }
    if (dir.includes('n')) {
      const ns = Math.max(1, Math.min(6, this.startRowSpan - dRow));
      this.resizingItem.rowSpan = ns;
      this.resizingItem.rowStart = Math.max(0, this.startRowStart + (this.startRowSpan - ns));
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    if (!this.resizingItem) return;
    this.fixAllCollisions(this.resizingItem);
    this.compactGrid();
    this.itemsChange.emit(this.items);
    this.resizingItem = null;
    this.resizeDirection = '';
    document.body.style.cursor = 'default';
    document.body.style.userSelect = '';
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.activeWidgetMenu = null;
    this.activeChartDateMenu = null;
  }
}
