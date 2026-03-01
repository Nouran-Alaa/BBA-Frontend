/**
 * dashboard-state.service.ts
 * Place at: src/app/core/services/dashboard-state.service.ts
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GridItem } from '../models/grid-item.model';
import { DashboardTemplateService } from './dashboard-template.service';

// ── Default dashboard — all 15 chart types ────────────────────────────────
const SEEDED_ITEMS: GridItem[] = [
  // Row 1 (rowSpan 2)
  {
    id: 'c1',
    type: 'chart',
    title: 'Buying Cycle',
    chartType: 'horizontal-bar-chart',
    colSpan: 4,
    rowSpan: 2,
    colStart: 0,
    rowStart: 0,
  },
  {
    id: 'c2',
    type: 'chart',
    title: 'Watching Triggers',
    chartType: 'ranked-bar-chart',
    colSpan: 4,
    rowSpan: 2,
    colStart: 4,
    rowStart: 0,
  },
  {
    id: 'c3',
    type: 'chart',
    title: 'Follower Growth',
    chartType: 'multi-line-chart',
    colSpan: 4,
    rowSpan: 2,
    colStart: 8,
    rowStart: 0,
  },
  // Row 2 (rowSpan 3)
  {
    id: 'c4',
    type: 'chart',
    title: 'Sentiment Analysis',
    chartType: 'donut-chart',
    colSpan: 4,
    rowSpan: 3,
    colStart: 0,
    rowStart: 2,
  },
  {
    id: 'c5',
    type: 'chart',
    title: 'Emotion Breakdown',
    chartType: 'rose-chart',
    colSpan: 4,
    rowSpan: 3,
    colStart: 4,
    rowStart: 2,
  },
  {
    id: 'c6',
    type: 'chart',
    title: 'Time Analysis - Greater Cairo',
    chartType: 'line-chart',
    colSpan: 4,
    rowSpan: 3,
    colStart: 8,
    rowStart: 2,
  },
  // Row 3 (rowSpan 3)
  {
    id: 'c7',
    type: 'chart',
    title: 'Gender - Total',
    chartType: 'gauge-chart',
    colSpan: 4,
    rowSpan: 3,
    colStart: 0,
    rowStart: 5,
  },
  {
    id: 'c8',
    type: 'chart',
    title: 'Buying Cycle',
    chartType: 'horizontal-bar-chart',
    colSpan: 4,
    rowSpan: 3,
    colStart: 4,
    rowStart: 5,
  },
  {
    id: 'c9',
    type: 'chart',
    title: 'Social Class',
    chartType: 'pie-chart',
    colSpan: 4,
    rowSpan: 3,
    colStart: 8,
    rowStart: 5,
  },
  // Row 4 (rowSpan 2)
  {
    id: 'c10',
    type: 'chart',
    title: 'Age Brackets',
    chartType: 'stacked-bar-chart',
    colSpan: 4,
    rowSpan: 2,
    colStart: 0,
    rowStart: 8,
  },
  {
    id: 'c11',
    type: 'chart',
    title: 'Political Sentiment',
    chartType: 'grouped-bar-chart',
    colSpan: 4,
    rowSpan: 2,
    colStart: 4,
    rowStart: 8,
  },
  {
    id: 'c12',
    type: 'chart',
    title: 'Regional Sentiment',
    chartType: 'map-chart',
    colSpan: 4,
    rowSpan: 2,
    colStart: 8,
    rowStart: 8,
  },
  // Row 5 (rowSpan 3)
  {
    id: 'c13',
    type: 'chart',
    title: 'Election Poll Aggregator',
    chartType: 'bar-chart',
    colSpan: 4,
    rowSpan: 3,
    colStart: 0,
    rowStart: 10,
  },
  {
    id: 'c14',
    type: 'chart',
    title: 'Reach vs Impressions',
    chartType: 'line-chart',
    colSpan: 4,
    rowSpan: 3,
    colStart: 4,
    rowStart: 10,
  },
  {
    id: 'c15',
    type: 'chart',
    title: 'Watching Triggers',
    chartType: 'ranked-bar-chart',
    colSpan: 4,
    rowSpan: 3,
    colStart: 8,
    rowStart: 10,
  },
];

// ── Migration: old specific names → new generic names ─────────────────────
const CHART_TYPE_MIGRATION: Record<string, string> = {
  'buying-cycle': 'horizontal-bar-chart',
  'watching-triggers': 'ranked-bar-chart',
  'viewership-by-runs': 'multi-line-chart',
  'time-analysis': 'line-chart',
  gender: 'gauge-chart',
  'sentiment-analysis': 'donut-chart',
  'emotion-donut': 'rose-chart',
  'age-brackets': 'stacked-bar-chart',
  'social-class': 'pie-chart',
  'political-sentiment': 'grouped-bar-chart',
  'election-poll': 'bar-chart',
  'regional-sentiment': 'map-chart',
};

function migrateItems(items: GridItem[]): GridItem[] {
  return items.map((item) => ({
    ...item,
    chartType:
      item.chartType && CHART_TYPE_MIGRATION[item.chartType]
        ? (CHART_TYPE_MIGRATION[item.chartType] as any)
        : item.chartType,
  }));
}

@Injectable({ providedIn: 'root' })
export class DashboardStateService {
  private dashboardsData: { [key: string]: GridItem[] } = { '1': SEEDED_ITEMS };
  private gridItemsSubject = new BehaviorSubject<GridItem[]>([]);
  gridItems$ = this.gridItemsSubject.asObservable();
  private currentDashboardIdSubject = new BehaviorSubject<string>('');
  currentDashboardId$ = this.currentDashboardIdSubject.asObservable();

  constructor(private templateService: DashboardTemplateService) {
    this.loadFromLocalStorage();
  }

  get gridItems(): GridItem[] {
    return this.gridItemsSubject.value;
  }
  get currentDashboardId(): string {
    return this.currentDashboardIdSubject.value;
  }
  get allDashboardsData(): { [key: string]: GridItem[] } {
    return this.dashboardsData;
  }

  switchDashboard(newId: string): void {
    const cur = this.currentDashboardId;
    if (cur && this.gridItems.length > 0) {
      this.dashboardsData[cur] = [...this.gridItems];
      this.saveToLocalStorage();
    }
    this.currentDashboardIdSubject.next(newId);
    this.loadDashboard(newId);
  }

  loadDashboard(id: string): void {
    if (this.dashboardsData[id]) {
      this.gridItemsSubject.next([...this.dashboardsData[id]]);
    } else {
      this.dashboardsData[id] = [];
      this.gridItemsSubject.next([]);
    }
  }

  setGridItems(items: GridItem[]): void {
    this.gridItemsSubject.next(items);
    this.dashboardsData[this.currentDashboardId] = [...items];
    this.saveToLocalStorage();
  }

  addWidget(widget: GridItem): void {
    const updated = [...this.gridItems, widget];
    this.gridItemsSubject.next(updated);
    this.dashboardsData[this.currentDashboardId] = [...updated];
    this.saveToLocalStorage();
  }

  deleteWidget(itemId: string): void {
    const updated = this.gridItems.filter((i) => i.id !== itemId);
    this.gridItemsSubject.next(updated);
    this.dashboardsData[this.currentDashboardId] = [...updated];
    this.saveToLocalStorage();
  }

  duplicateWidget(itemId: string): GridItem | null {
    const original = this.gridItems.find((i) => i.id === itemId);
    if (!original) return null;
    const maxRow =
      this.gridItems.length > 0
        ? Math.max(...this.gridItems.map((i) => (i.rowStart ?? 0) + i.rowSpan))
        : 0;
    const dup: GridItem = {
      ...JSON.parse(JSON.stringify(original)),
      id: Date.now().toString(),
      title: `${original.title} (Copy)`,
      colStart: original.colStart ?? 0,
      rowStart: Math.max((original.rowStart ?? 0) + original.rowSpan, maxRow),
    };
    this.addWidget(dup);
    return dup;
  }

  updateWidget(updated: GridItem): void {
    const idx = this.gridItems.findIndex((i) => i.id === updated.id);
    if (idx === -1) return;
    const arr = [...this.gridItems];
    arr[idx] = updated;
    this.gridItemsSubject.next(arr);
    this.dashboardsData[this.currentDashboardId] = [...arr];
    this.saveToLocalStorage();
  }

  applyTemplateWidgets(data: { dashboardId: string; widgets: any[] }): void {
    const widgets: GridItem[] = data.widgets.map((w, i) => ({
      id: `${Date.now()}-${i}`,
      ...w,
      colStart: w.colStart ?? 0,
      rowStart: w.rowStart ?? i,
    }));
    this.gridItemsSubject.next(widgets);
    this.dashboardsData[data.dashboardId] = [...widgets];
    this.saveToLocalStorage();
    this.templateService.clearTemplateWidgets();
  }

  createDashboard(widgets: GridItem[]): string {
    const ids = Object.keys(this.dashboardsData)
      .map(Number)
      .filter((n) => !isNaN(n));
    const newId = (ids.length > 0 ? Math.max(...ids) + 1 : 1).toString();
    this.dashboardsData[newId] = widgets;
    this.saveToLocalStorage();
    return newId;
  }

  addWidgetToDashboard(dashboardId: string, widget: GridItem): void {
    if (!this.dashboardsData[dashboardId]) this.dashboardsData[dashboardId] = [];
    const existing = this.dashboardsData[dashboardId];
    widget.rowStart =
      existing.length > 0 ? Math.max(...existing.map((i) => (i.rowStart ?? 0) + i.rowSpan)) : 0;
    this.dashboardsData[dashboardId].push(widget);
    this.saveToLocalStorage();
  }

  getDashboardsList(): { id: string; name: string }[] {
    return Object.keys(this.dashboardsData).map((id) => ({ id, name: `Dashboard ${id}` }));
  }

  saveToLocalStorage(): void {
    localStorage.setItem('dashboardsData', JSON.stringify(this.dashboardsData));
  }

  private loadFromLocalStorage(): void {
    const stored = localStorage.getItem('dashboardsData');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Migrate any stale old chart type names to new generic names
        Object.keys(parsed).forEach((id) => {
          parsed[id] = migrateItems(parsed[id]);
        });
        this.dashboardsData = parsed;
      } catch {
        this.dashboardsData = { '1': SEEDED_ITEMS };
      }
    }
  }
}
