import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  DateRangePickerComponent,
  DateRange,
} from '../../../shared/components/date-range-picker/date-range-picker.component';
import { AiChartModalComponent } from '../../../shared/components/ai-chart-modal/ai-chart-modal.component';
import {
  DashboardGridComponent,
  GridItem,
} from '../../../shared/components/dashboard-grid/dashboard-grid.component';
import { FullscreenWidgetModalComponent } from '../../../shared/components/fullscreen-widget-modal/fullscreen-widget-modal.component';
import { ToastService } from '../../../core/services/toast.service';
import { DashboardTemplateService } from '../../../core/services/dashboard-template.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-container',
  standalone: true,
  imports: [
    CommonModule,
    DateRangePickerComponent,
    AiChartModalComponent,
    DashboardGridComponent,
    FullscreenWidgetModalComponent,
  ],
  templateUrl: './dashboard-container.component.html',
  styleUrls: ['./dashboard-container.component.css'],
})
export class DashboardContainerComponent implements OnInit {
  @ViewChild('datePickerContainer') datePickerContainer?: ElementRef;
  @ViewChild('chartDatePickerContainer') chartDatePickerContainer?: ElementRef;

  currentDateRange: DateRange | null = null;
  isDatePickerOpen: boolean = false;
  isAiChatOpen: boolean = false;
  isGenerating: boolean = false;
  isEditMode: boolean = false;
  currentDashboardId: string = '';
  fullscreenWidget: GridItem | null = null;
  chartDateRanges: { [chartId: string]: DateRange } = {};
  gridItems: GridItem[] = [];

  dashboardsData: { [key: string]: GridItem[] } = {
    '1': [
      {
        id: '1',
        type: 'summary',
        title: 'AI Executive Summary',
        content: 'No tasks were updated in the last week.',
        colSpan: 6,
        rowSpan: 2,
      },
      {
        id: '2',
        type: 'count',
        title: 'Unassigned',
        value: 0,
        label: 'tasks',
        colSpan: 2,
        rowSpan: 1,
      },
      {
        id: '3',
        type: 'count',
        title: 'In Progress',
        value: 0,
        label: 'tasks',
        colSpan: 2,
        rowSpan: 1,
      },
      {
        id: '4',
        type: 'count',
        title: 'Completed',
        value: 0,
        label: 'tasks',
        colSpan: 2,
        rowSpan: 1,
      },
    ],
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private templateService: DashboardTemplateService,
  ) {}

  private templateSubscription?: Subscription;

  ngOnInit(): void {
    // Subscribe to route params FIRST
    this.route.params.subscribe((params) => {
      const newDashboardId = params['id'] || '1';

      // Check if switching dashboards
      if (this.currentDashboardId !== newDashboardId) {
        // Save current dashboard before switching
        if (this.currentDashboardId && this.gridItems.length > 0) {
          this.dashboardsData[this.currentDashboardId] = [...this.gridItems];
        }

        this.currentDashboardId = newDashboardId;
        this.loadDashboard(newDashboardId);
      }
    });

    // Subscribe to template widgets
    this.templateSubscription = this.templateService.templateWidgets$.subscribe((widgets) => {
      if (widgets && widgets.length > 0) {
        console.log('Received template widgets for dashboard:', this.currentDashboardId);
        const widgetsWithIds = widgets.map((widget, index) => ({
          id: `${Date.now()}-${index}`,
          ...widget,
        }));
        this.gridItems = widgetsWithIds;
        this.dashboardsData[this.currentDashboardId] = [...this.gridItems];
        this.templateService.clearTemplateWidgets();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.templateSubscription) {
      this.templateSubscription.unsubscribe();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Close main date picker
    if (this.isDatePickerOpen && this.datePickerContainer) {
      const clickedInside = this.datePickerContainer.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.isDatePickerOpen = false;
      }
    }
  }

  loadTemplateWidgets(templateWidgets: any[]): void {
    this.gridItems = templateWidgets.map((widget, index) => ({
      id: `${Date.now()}-${index}`,
      ...widget,
    }));
    this.dashboardsData[this.currentDashboardId] = [...this.gridItems];
  }

  loadDashboard(dashboardId: string): void {
    console.log('Loading dashboard:', dashboardId);

    if (this.dashboardsData[dashboardId]) {
      // Load existing dashboard data
      this.gridItems = [...this.dashboardsData[dashboardId]];
      console.log('Loaded existing dashboard with items:', this.gridItems.length);
    } else {
      // New empty dashboard
      this.gridItems = [];
      this.dashboardsData[dashboardId] = [];
      console.log('Created new empty dashboard');
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
      const newItem: GridItem = {
        id: Date.now().toString(),
        type: 'chart',
        title: 'AI Generated Chart',
        prompt: prompt,
        chartData: {},
        colSpan: 6,
        rowSpan: 3,
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

  onChartDateRangeClick(data: { chartId: string; range: any }): void {
    const { chartId, range } = data;
    this.chartDateRanges[chartId] = range;
    console.log('Chart date range updated:', chartId, range);
  }

  onItemDuplicate(itemId: string): void {
    const itemToDuplicate = this.gridItems.find((item) => item.id === itemId);
    if (itemToDuplicate) {
      const duplicatedItem: GridItem = {
        ...itemToDuplicate,
        id: Date.now().toString(),
        title: `${itemToDuplicate.title} (Copy)`,
      };
      this.gridItems.push(duplicatedItem);
      this.dashboardsData[this.currentDashboardId] = [...this.gridItems];
    }
  }

  onItemDelete(itemId: string): void {
    this.gridItems = this.gridItems.filter((item) => item.id !== itemId);
    this.dashboardsData[this.currentDashboardId] = [...this.gridItems];
  }

  onWidgetClick(widget: GridItem): void {
    this.fullscreenWidget = widget;
  }

  closeFullscreen(): void {
    this.fullscreenWidget = null;
  }
}
