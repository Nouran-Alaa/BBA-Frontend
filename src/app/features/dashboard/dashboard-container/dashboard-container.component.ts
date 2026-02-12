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
import { EditAiModalComponent } from '../../../shared/components/edit-ai-modal/edit-ai-modal.component';

@Component({
  selector: 'app-dashboard-container',
  standalone: true,
  imports: [
    CommonModule,
    DateRangePickerComponent,
    AiChartModalComponent,
    DashboardGridComponent,
    FullscreenWidgetModalComponent,
    EditAiModalComponent,
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
  editingWidget: GridItem | null = null;
  showEditAiModal: boolean = false;

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
    // Subscribe to template data FIRST
    this.templateSubscription = this.templateService.templateData$.subscribe((data) => {
      if (data && data.widgets && data.widgets.length > 0) {
        console.log('Received template data for dashboard:', data.dashboardId);

        // Only apply if it's for the current dashboard
        if (data.dashboardId === this.currentDashboardId) {
          const widgetsWithIds = data.widgets.map((widget, index) => ({
            id: `${Date.now()}-${index}`,
            ...widget,
          }));
          this.gridItems = widgetsWithIds;
          this.dashboardsData[this.currentDashboardId] = [...this.gridItems];
          console.log('Applied template widgets to dashboard:', this.currentDashboardId);
          this.templateService.clearTemplateWidgets();
        }
      }
    });

    // Subscribe to route params
    this.route.params.subscribe((params) => {
      const newDashboardId = params['id'] || '1';

      if (this.currentDashboardId !== newDashboardId) {
        // Save current dashboard before switching
        if (this.currentDashboardId && this.gridItems.length > 0) {
          this.dashboardsData[this.currentDashboardId] = [...this.gridItems];
        }

        this.currentDashboardId = newDashboardId;
        this.loadDashboard(newDashboardId);
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

  onEditWithAI(widget: GridItem): void {
    this.editingWidget = widget;
    this.showEditAiModal = true;
  }

  onSaveEditedWidget(updatedWidget: GridItem): void {
    const index = this.gridItems.findIndex((item) => item.id === updatedWidget.id);
    if (index !== -1) {
      this.gridItems[index] = updatedWidget;
      this.dashboardsData[this.currentDashboardId] = [...this.gridItems];
      this.toastService.success('Widget updated successfully!');
    }
    this.showEditAiModal = false;
    this.editingWidget = null;
  }

  closeEditAiModal(): void {
    this.showEditAiModal = false;
    this.editingWidget = null;
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
