import { Component, OnInit, HostListener, ViewChild, ElementRef, OnDestroy } from '@angular/core';
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
import { UndoRedoService } from '../../../core/services/undo-redo.service';

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
export class DashboardContainerComponent implements OnInit, OnDestroy {
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

  private templateSubscription?: Subscription;
  private routeSubscription?: Subscription;
  private pendingTemplateData: { dashboardId: string; widgets: any[] } | null = null;
  private lastUndoRedoTime = 0;
  private readonly UNDO_REDO_COOLDOWN = 100; // ms

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private undoRedoService: UndoRedoService,
    private templateService: DashboardTemplateService,
  ) {}

  ngOnInit(): void {
    console.log('Dashboard container initialized');

    // Load from localStorage first
    const stored = localStorage.getItem('dashboardsData');
    if (stored) {
      this.dashboardsData = JSON.parse(stored);
      console.log('Loaded dashboards from localStorage:', Object.keys(this.dashboardsData));
    }

    // Subscribe to template data FIRST
    this.templateSubscription = this.templateService.templateData$.subscribe((data) => {
      console.log('Template data received:', data);

      if (data && data.widgets && data.widgets.length > 0) {
        // Store the pending template data
        this.pendingTemplateData = data;
        console.log('Received template data for dashboard:', data.dashboardId);

        // If this is the current dashboard, apply immediately
        if (data.dashboardId === this.currentDashboardId) {
          this.applyTemplateWidgets(data);
        }
      }
    });

    // Subscribe to route params
    this.route.params.subscribe((params) => {
      const newDashboardId = params['id'] || '1';
      console.log('Route changed to dashboard:', newDashboardId);

      if (this.currentDashboardId !== newDashboardId) {
        // Save current dashboard before switching
        if (this.currentDashboardId && this.gridItems.length > 0) {
          this.dashboardsData[this.currentDashboardId] = [...this.gridItems];
          this.saveToLocalStorage();
          console.log(
            'Saved dashboard:',
            this.currentDashboardId,
            'with',
            this.gridItems.length,
            'items',
          );
        }

        this.currentDashboardId = newDashboardId;

        // Check if we have pending template data for this dashboard
        if (this.pendingTemplateData && this.pendingTemplateData.dashboardId === newDashboardId) {
          console.log('Applying pending template data for dashboard:', newDashboardId);
          this.applyTemplateWidgets(this.pendingTemplateData);
        } else {
          // Load existing dashboard data
          this.loadDashboard(newDashboardId);
        }
      }
    });

    // Initialize undo/redo with current state
    this.undoRedoService.reset(this.gridItems);

    // Listen for keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  ngOnDestroy(): void {
    console.log('Dashboard container destroyed');

    // Save current dashboard state
    if (this.currentDashboardId && this.gridItems.length > 0) {
      this.dashboardsData[this.currentDashboardId] = [...this.gridItems];
      this.saveToLocalStorage();
    }

    if (this.templateSubscription) {
      this.templateSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }

    document.removeEventListener('keydown', this.handleKeyboardShortcut.bind(this));
  }

  saveToLocalStorage(): void {
    localStorage.setItem('dashboardsData', JSON.stringify(this.dashboardsData));
    console.log('Saved to localStorage:', Object.keys(this.dashboardsData));
  }

  setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', this.handleKeyboardShortcut.bind(this));
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

  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent): void {
    // Ignore repeated keydown events
    if (event.repeat) return;

    // Throttle to prevent rapid-fire (additional safety)
    const now = Date.now();
    if (now - this.lastUndoRedoTime < this.UNDO_REDO_COOLDOWN) {
      return;
    }

    // Ctrl+Z or Cmd+Z (Mac) - Undo
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      this.lastUndoRedoTime = now;
      this.undo();
    }

    // Ctrl+Shift+Z or Cmd+Shift+Z (Mac) - Redo
    else if ((event.ctrlKey || event.metaKey) && event.key === 'z' && event.shiftKey) {
      event.preventDefault();
      this.lastUndoRedoTime = now;
      this.redo();
    }

    // Alternative: Ctrl+Y (Windows redo)
    else if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
      event.preventDefault();
      this.lastUndoRedoTime = now;
      this.redo();
    }
  }

  undo(): void {
    if (!this.undoRedoService.canUndo()) {
      this.toastService.info('Nothing to undo');
      return;
    }

    const previousState = this.undoRedoService.undo();
    if (previousState) {
      this.gridItems = previousState;
      this.dashboardsData[this.currentDashboardId] = [...previousState];
      this.saveToLocalStorage();
      this.toastService.success('Undo successful');
    }
  }

  redo(): void {
    if (!this.undoRedoService.canRedo()) {
      this.toastService.info('Nothing to redo');
      return;
    }

    const nextState = this.undoRedoService.redo();
    if (nextState) {
      this.gridItems = nextState;
      this.dashboardsData[this.currentDashboardId] = [...nextState];
      this.saveToLocalStorage();
      this.toastService.success('Redo successful');
    }
  }

  applyTemplateWidgets(data: { dashboardId: string; widgets: any[] }): void {
    console.log(
      'Applying template widgets:',
      data.widgets.length,
      'widgets to dashboard:',
      data.dashboardId,
    );

    // Map widgets with IDs and ensure positions are set
    const widgetsWithIds = data.widgets.map((widget, index) => ({
      id: `${Date.now()}-${index}`,
      ...widget,
      colStart: widget.colStart ?? 0,
      rowStart: widget.rowStart ?? index,
    }));

    // Verify no overlaps in template
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

    this.gridItems = widgetsWithIds;
    this.dashboardsData[data.dashboardId] = [...this.gridItems];
    this.saveToLocalStorage();

    console.log('Template applied successfully. Grid items:', this.gridItems.length);

    // Clear the pending data and service
    this.pendingTemplateData = null;
    this.templateService.clearTemplateWidgets();
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
      this.undoRedoService.reset(this.gridItems);
      console.log('Loaded existing dashboard with items:', this.gridItems.length);
    } else {
      // New empty dashboard
      this.gridItems = [];
      this.dashboardsData[dashboardId] = [];
      this.undoRedoService.reset([]);
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
      this.saveToLocalStorage();
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
      this.undoRedoService.saveState(this.gridItems, 'Widget added');

      const newItem: GridItem = {
        id: Date.now().toString(),
        type: 'chart',
        title: 'AI Generated Chart',
        prompt: prompt,
        chartData: {},
        colSpan: 6,
        rowSpan: 3,
        colStart: 0,
        rowStart: this.gridItems.length,
      };

      this.gridItems.push(newItem);
      this.dashboardsData[this.currentDashboardId] = [...this.gridItems];
      this.saveToLocalStorage();
      this.isGenerating = false;
      this.isAiChatOpen = false;
    }, 3000);
  }

  onGridItemsChange(items: GridItem[]): void {
    this.undoRedoService.saveState(this.gridItems, 'Layout changed'); // Save BEFORE change
    this.gridItems = items;
    this.dashboardsData[this.currentDashboardId] = [...items];
    this.saveToLocalStorage();
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
      this.undoRedoService.saveState(this.gridItems, 'Widget duplicated');
      const duplicatedItem: GridItem = {
        ...itemToDuplicate,
        id: Date.now().toString(),
        title: `${itemToDuplicate.title} (Copy)`,
      };
      this.gridItems.push(duplicatedItem);
      this.dashboardsData[this.currentDashboardId] = [...this.gridItems];
      this.saveToLocalStorage();
      this.toastService.success('Widget duplicated');
    }
  }

  onItemDelete(itemId: string): void {
    this.undoRedoService.saveState(this.gridItems, 'Widget deleted');
    this.gridItems = this.gridItems.filter((item) => item.id !== itemId);
    this.dashboardsData[this.currentDashboardId] = [...this.gridItems];
    this.saveToLocalStorage();
    this.toastService.success('Widget deleted');
  }

  onWidgetClick(widget: GridItem): void {
    this.fullscreenWidget = widget;
  }

  closeFullscreen(): void {
    this.fullscreenWidget = null;
  }

  getUndoRedoStatus() {
    return this.undoRedoService.getHistoryInfo();
  }
}
