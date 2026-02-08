import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  DateRangePickerComponent,
  DateRange,
} from '../../../shared/components/date-range-picker/date-range-picker.component';
import { AiChatModalComponent } from '../../../shared/components/ai-chat-modal/ai-chat-modal.component';
import {
  DashboardGridComponent,
  GridItem,
} from '../../../shared/components/dashboard-grid/dashboard-grid.component';

@Component({
  selector: 'app-dashboard-container',
  standalone: true,
  imports: [CommonModule, DateRangePickerComponent, AiChatModalComponent, DashboardGridComponent],
  templateUrl: './dashboard-container.component.html',
  styleUrls: ['./dashboard-container.component.css'],
})
export class DashboardContainerComponent implements OnInit {
  currentDateRange: DateRange | null = null;
  isDatePickerOpen: boolean = false;
  isAiChatOpen: boolean = false;
  isGenerating: boolean = false;
  isEditMode: boolean = false;
  currentDashboardId: string = '';

  // Mock dashboards storage
  dashboardsData: { [key: string]: GridItem[] } = {
    '1': [
      {
        id: '1',
        type: 'summary',
        title: 'AI Executive Summary',
        content: 'No tasks were updated in the last week.',
        x: 0,
        y: 0,
        w: 6,
        h: 2,
      },
      {
        id: '2',
        type: 'count',
        title: 'Unassigned',
        value: 0,
        label: 'tasks',
        x: 6,
        y: 0,
        w: 2,
        h: 1,
      },
      {
        id: '3',
        type: 'count',
        title: 'In Progress',
        value: 0,
        label: 'tasks',
        x: 8,
        y: 0,
        w: 2,
        h: 1,
      },
      {
        id: '4',
        type: 'count',
        title: 'Completed',
        value: 0,
        label: 'tasks',
        x: 10,
        y: 0,
        w: 2,
        h: 1,
      },
    ],
  };

  gridItems: GridItem[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.currentDashboardId = params['id'] || '1';
      this.loadDashboard(this.currentDashboardId);
    });
  }

  loadDashboard(dashboardId: string): void {
    // Load dashboard data or create empty one
    if (this.dashboardsData[dashboardId]) {
      this.gridItems = [...this.dashboardsData[dashboardId]];
    } else {
      // New dashboard - empty
      this.gridItems = [];
      this.dashboardsData[dashboardId] = [];
    }
  }

  onDateRangeChange(range: DateRange): void {
    this.currentDateRange = range;
    this.isDatePickerOpen = false;
  }

  toggleDatePicker(): void {
    this.isDatePickerOpen = !this.isDatePickerOpen;
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
  }

  openAiChat(): void {
    this.isAiChatOpen = true;
  }

  closeAiChat(): void {
    this.isAiChatOpen = false;
  }

  onChartGenerated(prompt: string): void {
    this.isGenerating = true;

    setTimeout(() => {
      const maxY =
        this.gridItems.length > 0 ? Math.max(...this.gridItems.map((item) => item.y + item.h)) : 0;

      const newItem: GridItem = {
        id: Date.now().toString(),
        type: 'chart',
        title: 'AI Generated Chart',
        prompt: prompt,
        chartData: {},
        x: 0,
        y: maxY,
        w: 6,
        h: 3,
      };

      this.gridItems.push(newItem);
      this.dashboardsData[this.currentDashboardId] = [...this.gridItems];
      this.isGenerating = false;
      this.isAiChatOpen = false;
    }, 3000);
  }

  onGridItemsChange(items: GridItem[]): void {
    this.gridItems = items;
    this.dashboardsData[this.currentDashboardId] = [...items];
  }

  getFormattedDateRange(): string {
    if (!this.currentDateRange) return 'Select Date Range';
    const start = new Date(this.currentDateRange.startDate);
    const end = new Date(this.currentDateRange.endDate);
    return `${this.formatDate(start)} - ${this.formatDate(end)}`;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
