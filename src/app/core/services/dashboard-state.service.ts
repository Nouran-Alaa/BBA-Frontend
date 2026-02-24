import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GridItem } from '../models/grid-item.model';
import { DashboardTemplateService } from './dashboard-template.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardStateService {
  // ─── State ───────────────────────────────────────────────────────────────────

  private dashboardsData: { [key: string]: GridItem[] } = {
    '1': [
      {
        id: '1',
        type: 'summary',
        title: 'AI Executive Summary',
        content: 'No tasks were updated in the last week.',
        colSpan: 6,
        rowSpan: 2,
        colStart: 0,
        rowStart: 0,
      },
      {
        id: '2',
        type: 'count',
        title: 'Unassigned',
        value: 0,
        label: 'tasks',
        colSpan: 2,
        rowSpan: 1,
        colStart: 6,
        rowStart: 0,
      },
      {
        id: '3',
        type: 'count',
        title: 'In Progress',
        value: 0,
        label: 'tasks',
        colSpan: 2,
        rowSpan: 1,
        colStart: 8,
        rowStart: 0,
      },
      {
        id: '4',
        type: 'count',
        title: 'Completed',
        value: 0,
        label: 'tasks',
        colSpan: 2,
        rowSpan: 1,
        colStart: 10,
        rowStart: 0,
      },
    ],
  };

  private gridItemsSubject = new BehaviorSubject<GridItem[]>([]);
  gridItems$ = this.gridItemsSubject.asObservable();

  private currentDashboardIdSubject = new BehaviorSubject<string>('');
  currentDashboardId$ = this.currentDashboardIdSubject.asObservable();

  constructor(private templateService: DashboardTemplateService) {
    this.loadFromLocalStorage();
  }

  // ─── Getters ─────────────────────────────────────────────────────────────────

  get gridItems(): GridItem[] {
    return this.gridItemsSubject.value;
  }

  get currentDashboardId(): string {
    return this.currentDashboardIdSubject.value;
  }

  get allDashboardsData(): { [key: string]: GridItem[] } {
    return this.dashboardsData;
  }

  // ─── Dashboard Loading ────────────────────────────────────────────────────────

  /**
   * Switch to a dashboard by ID.
   * Saves the current dashboard first, then loads the new one.
   */
  switchDashboard(newId: string): void {
    const currentId = this.currentDashboardId;

    // Save current dashboard before switching
    if (currentId && this.gridItems.length > 0) {
      this.dashboardsData[currentId] = [...this.gridItems];
      this.saveToLocalStorage();
      console.log('Saved dashboard:', currentId, 'with', this.gridItems.length, 'items');
    }

    this.currentDashboardIdSubject.next(newId);
    this.loadDashboard(newId);
  }

  /**
   * Load dashboard data into the active grid.
   */
  loadDashboard(dashboardId: string): void {
    console.log('Loading dashboard:', dashboardId);

    if (this.dashboardsData[dashboardId]) {
      const items = [...this.dashboardsData[dashboardId]];
      this.gridItemsSubject.next(items);
      console.log('Loaded existing dashboard with items:', items.length);
    } else {
      // New empty dashboard
      this.dashboardsData[dashboardId] = [];
      this.gridItemsSubject.next([]);
      console.log('Created new empty dashboard');
    }
  }

  // ─── Widget CRUD ──────────────────────────────────────────────────────────────

  /**
   * Replace all grid items (used after drag/resize).
   */
  setGridItems(items: GridItem[]): void {
    this.gridItemsSubject.next(items);
    this.dashboardsData[this.currentDashboardId] = [...items];
    this.saveToLocalStorage();
  }

  /**
   * Add a new widget to the current dashboard.
   */
  addWidget(widget: GridItem): void {
    const updated = [...this.gridItems, widget];
    this.gridItemsSubject.next(updated);
    this.dashboardsData[this.currentDashboardId] = [...updated];
    this.saveToLocalStorage();
  }

  /**
   * Delete a widget by ID.
   */
  deleteWidget(itemId: string): void {
    const updated = this.gridItems.filter((item) => item.id !== itemId);
    this.gridItemsSubject.next(updated);
    this.dashboardsData[this.currentDashboardId] = [...updated];
    this.saveToLocalStorage();
  }

  /**
   * Duplicate a widget by ID.
   * Returns the duplicated item (so callers can save undo state before calling).
   */
  duplicateWidget(itemId: string): GridItem | null {
    const original = this.gridItems.find((item) => item.id === itemId);
    if (!original) return null;

    const duplicate: GridItem = {
      ...original,
      id: Date.now().toString(),
      title: `${original.title} (Copy)`,
    };

    this.addWidget(duplicate);
    return duplicate;
  }

  /**
   * Update an existing widget in place.
   */
  updateWidget(updatedWidget: GridItem): void {
    const index = this.gridItems.findIndex((item) => item.id === updatedWidget.id);
    if (index === -1) return;

    const updated = [...this.gridItems];
    updated[index] = updatedWidget;
    this.gridItemsSubject.next(updated);
    this.dashboardsData[this.currentDashboardId] = [...updated];
    this.saveToLocalStorage();
  }

  // ─── Template Application ─────────────────────────────────────────────────────

  /**
   * Apply a template's widgets to a specific dashboard.
   */
  applyTemplateWidgets(data: { dashboardId: string; widgets: any[] }): void {
    console.log(
      'Applying template widgets:',
      data.widgets.length,
      'widgets to dashboard:',
      data.dashboardId,
    );

    // Map widgets with IDs and ensure positions are set
    const widgetsWithIds: GridItem[] = data.widgets.map((widget, index) => ({
      id: `${Date.now()}-${index}`,
      ...widget,
      colStart: widget.colStart ?? 0,
      rowStart: widget.rowStart ?? index,
    }));

    // Verify and fix any overlaps in the template
    for (let i = 0; i < widgetsWithIds.length; i++) {
      for (let j = i + 1; j < widgetsWithIds.length; j++) {
        const a = widgetsWithIds[i];
        const b = widgetsWithIds[j];

        const aCol = a.colStart ?? 0;
        const bCol = b.colStart ?? 0;
        const aRow = a.rowStart ?? 0;
        const bRow = b.rowStart ?? 0;

        const overlaps = !(
          aCol + a.colSpan <= bCol ||
          aCol >= bCol + b.colSpan ||
          aRow + a.rowSpan <= bRow ||
          aRow >= bRow + b.rowSpan
        );

        if (overlaps) {
          console.warn('Template has overlapping widgets:', a.title, 'and', b.title);
          // Fix by moving second widget down
          widgetsWithIds[j].rowStart = (a.rowStart ?? 0) + a.rowSpan;
        }
      }
    }

    this.gridItemsSubject.next(widgetsWithIds);
    this.dashboardsData[data.dashboardId] = [...widgetsWithIds];
    this.saveToLocalStorage();

    console.log('Template applied successfully. Grid items:', widgetsWithIds.length);

    // Clear the template service state
    this.templateService.clearTemplateWidgets();
  }

  // ─── Cross-Dashboard Operations ───────────────────────────────────────────────

  /**
   * Create a brand new dashboard with the given widgets.
   * Returns the new dashboard ID.
   */
  createDashboard(widgets: GridItem[]): string {
    const allIds = Object.keys(this.dashboardsData)
      .map((id) => parseInt(id))
      .filter((id) => !isNaN(id));
    const maxId = allIds.length > 0 ? Math.max(...allIds) : 0;
    const newId = (maxId + 1).toString();

    this.dashboardsData[newId] = widgets;
    this.saveToLocalStorage();

    console.log('New dashboard created:', newId, 'with', widgets.length, 'widgets');
    return newId;
  }

  /**
   * Add a widget to a specific dashboard (not necessarily the current one).
   */
  addWidgetToDashboard(dashboardId: string, widget: GridItem): void {
    if (!this.dashboardsData[dashboardId]) {
      this.dashboardsData[dashboardId] = [];
    }

    const existing = this.dashboardsData[dashboardId];
    widget.rowStart =
      existing.length > 0 ? Math.max(...existing.map((i) => (i.rowStart ?? 0) + i.rowSpan)) : 0;

    this.dashboardsData[dashboardId].push(widget);
    this.saveToLocalStorage();
    console.log('Added widget to dashboard:', dashboardId);
  }

  /**
   * Get a list of all dashboards (id + name) for use in selectors/chatbot.
   */
  getDashboardsList(): { id: string; name: string }[] {
    return Object.keys(this.dashboardsData).map((id) => ({
      id,
      name: `Dashboard ${id}`,
    }));
  }

  // ─── Persistence ──────────────────────────────────────────────────────────────

  saveToLocalStorage(): void {
    localStorage.setItem('dashboardsData', JSON.stringify(this.dashboardsData));
    console.log('Saved to localStorage:', Object.keys(this.dashboardsData));
  }

  private loadFromLocalStorage(): void {
    const stored = localStorage.getItem('dashboardsData');
    if (stored) {
      this.dashboardsData = JSON.parse(stored);
      console.log('Loaded dashboards from localStorage:', Object.keys(this.dashboardsData));
    }
  }
}
