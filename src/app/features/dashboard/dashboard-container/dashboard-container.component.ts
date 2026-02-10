import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
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
import { FullscreenWidgetModalComponent } from '../../../shared/components/fullscreen-widget-modal/fullscreen-widget-modal.component';

@Component({
  selector: 'app-dashboard-container',
  standalone: true,
  imports: [
    CommonModule,
    DateRangePickerComponent,
    AiChatModalComponent,
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
  isChartDatePickerOpen: boolean = false;
  isAiChatOpen: boolean = false;
  isGenerating: boolean = false;
  isEditMode: boolean = false;
  currentDashboardId: string = '';
  fullscreenWidget: GridItem | null = null;
  selectedChartForDateRange: string | null = null;
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Close main date picker
    if (this.isDatePickerOpen && this.datePickerContainer) {
      const clickedInside = this.datePickerContainer.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.isDatePickerOpen = false;
      }
    }

    // Close chart date picker
    if (this.isChartDatePickerOpen && this.chartDatePickerContainer) {
      const clickedInside = this.chartDatePickerContainer.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.isChartDatePickerOpen = false;
        this.selectedChartForDateRange = null;
      }
    }
  }

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.currentDashboardId = params['id'] || '1';
      this.loadDashboard(this.currentDashboardId);
    });
  }

  loadDashboard(dashboardId: string): void {
    if (this.dashboardsData[dashboardId]) {
      this.gridItems = [...this.dashboardsData[dashboardId]];
    } else {
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

  onChartDateRangeClick(chartId: string): void {
    this.selectedChartForDateRange = chartId;
    this.isChartDatePickerOpen = true;
    this.isDatePickerOpen = false; // Close main date picker
    console.log('Opening date picker for chart:', chartId);
  }

  onChartDateRangeChange(range: DateRange): void {
    if (this.selectedChartForDateRange) {
      this.chartDateRanges[this.selectedChartForDateRange] = range;
      console.log('Chart date range updated:', this.selectedChartForDateRange, range);
    }
    this.isChartDatePickerOpen = false;
    this.selectedChartForDateRange = null;
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
