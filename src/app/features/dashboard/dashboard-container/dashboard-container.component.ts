import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { DashboardStateService } from '../../../core/services/dashboard-state.service';
import { UndoRedoService } from '../../../core/services/undo-redo.service';
import { ToastService } from '../../../core/services/toast.service';
import { ChatService } from '../../../core/services/chat.service';
import {
  DashboardTemplateService,
  DashboardTemplate,
} from '../../../core/services/dashboard-template.service';

import { GridItem } from '../../../core/models/grid-item.model';
import { DateRange } from '../../../shared/components/action_menus/date-range-picker/date-range-picker.component';

import { DashboardToolbarComponent } from '../dashboard-toolbar/dashboard-toolbar.component';
import { DashboardGridComponent } from '../../../shared/components/dashboard-grid/dashboard-grid.component';
import { AiChartModalComponent } from '../../../shared/components/modals/ai-chart-modal/ai-chart-modal.component';
import { FullscreenWidgetModalComponent } from '../../../shared/components/modals/fullscreen-widget-modal/fullscreen-widget-modal.component';
import { EditAiModalComponent } from '../../../shared/components/modals/edit-ai-modal/edit-ai-modal.component';
import {
  ChatbotComponent,
  DashboardInfo,
} from '../../../shared/components/layout/chatbot/chatbot.component';

@Component({
  selector: 'app-dashboard-container',
  standalone: true,
  imports: [
    CommonModule,
    DashboardToolbarComponent,
    DashboardGridComponent,
    AiChartModalComponent,
    FullscreenWidgetModalComponent,
    EditAiModalComponent,
    ChatbotComponent,
  ],
  templateUrl: './dashboard-container.component.html',
  styleUrls: ['./dashboard-container.component.css'],
})
export class DashboardContainerComponent implements OnInit, OnDestroy {
  // ─── State exposed to template ────────────────────────────────────────────────
  gridItems: GridItem[] = [];
  currentDashboardId: string = '';
  isEditMode: boolean = false;

  // Modal visibility flags
  isAiChatOpen: boolean = false;
  isChatbotOpen: boolean = false;
  isGenerating: boolean = false;
  fullscreenWidget: GridItem | null = null;
  editingWidget: GridItem | null = null;
  showEditAiModal: boolean = false;

  // Chart date ranges (per chart widget)
  chartDateRanges: { [chartId: string]: DateRange } = {};

  // ─── Private ──────────────────────────────────────────────────────────────────
  private templateSubscription?: Subscription;
  private gridItemsSubscription?: Subscription;
  private pendingTemplateData: { dashboardId: string; widgets: any[] } | null = null;
  private lastUndoRedoTime = 0;
  private readonly UNDO_REDO_COOLDOWN = 100; // ms

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dashboardState: DashboardStateService,
    private undoRedoService: UndoRedoService,
    private toastService: ToastService,
    private chatService: ChatService,
    private templateService: DashboardTemplateService,
  ) {}

  ngOnInit(): void {
    console.log('Dashboard container initialized');

    // Keep local gridItems in sync with service
    this.gridItemsSubscription = this.dashboardState.gridItems$.subscribe((items) => {
      this.gridItems = items;
    });

    // Subscribe to template data FIRST (before route params)
    this.templateSubscription = this.templateService.templateData$.subscribe((data) => {
      console.log('Template data received:', data);

      if (data && data.widgets && data.widgets.length > 0) {
        // Store the pending template data
        this.pendingTemplateData = data;
        console.log('Received template data for dashboard:', data.dashboardId);

        // If this is the current dashboard, apply immediately
        if (data.dashboardId === this.currentDashboardId) {
          this.undoRedoService.saveState(this.gridItems, 'Template applied');
          this.dashboardState.applyTemplateWidgets(data);
        }
      }
    });

    // Subscribe to route params
    this.route.params.subscribe((params) => {
      const newDashboardId = params['id'] || '1';
      console.log('Route changed to dashboard:', newDashboardId);

      if (this.currentDashboardId !== newDashboardId) {
        this.currentDashboardId = newDashboardId;

        // Check if we have pending template data for this dashboard
        if (this.pendingTemplateData && this.pendingTemplateData.dashboardId === newDashboardId) {
          console.log('Applying pending template data for dashboard:', newDashboardId);
          this.dashboardState.switchDashboard(newDashboardId);
          this.undoRedoService.saveState([], 'Template applied');
          this.dashboardState.applyTemplateWidgets(this.pendingTemplateData);
          this.pendingTemplateData = null;
        } else {
          this.dashboardState.switchDashboard(newDashboardId);
          this.undoRedoService.reset(this.dashboardState.gridItems);
        }

        // Update chatbot context when dashboard changes
        this.chatService.setContext({ currentDashboardId: newDashboardId });
      }
    });

    // Listen for keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  ngOnDestroy(): void {
    console.log('Dashboard container destroyed');

    // Final save on destroy
    this.dashboardState.saveToLocalStorage();

    this.templateSubscription?.unsubscribe();
    this.gridItemsSubscription?.unsubscribe();
    document.removeEventListener('keydown', this.handleKeyboardShortcut.bind(this));
  }

  // ─── Keyboard Shortcuts ───────────────────────────────────────────────────────

  setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', this.handleKeyboardShortcut.bind(this));
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

  // ─── Edit Mode & Undo/Redo ────────────────────────────────────────────────────

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
  }

  undo(): void {
    if (!this.undoRedoService.canUndo()) {
      this.toastService.info('Nothing to undo');
      return;
    }

    const previousState = this.undoRedoService.undo();
    if (previousState) {
      this.dashboardState.setGridItems(previousState);
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
      this.dashboardState.setGridItems(nextState);
      this.toastService.success('Redo successful');
    }
  }

  getUndoRedoStatus() {
    return this.undoRedoService.getHistoryInfo();
  }

  // ─── Grid Events ──────────────────────────────────────────────────────────────

  onGridItemsChange(items: GridItem[]): void {
    this.undoRedoService.saveState(this.gridItems, 'Layout changed'); // Save BEFORE change
    this.dashboardState.setGridItems(items);
  }

  onItemDelete(itemId: string): void {
    this.undoRedoService.saveState(this.gridItems, 'Widget deleted');
    this.dashboardState.deleteWidget(itemId);
    this.toastService.success('Widget deleted');
  }

  onItemDuplicate(itemId: string): void {
    this.undoRedoService.saveState(this.gridItems, 'Widget duplicated');
    this.dashboardState.duplicateWidget(itemId);
    this.toastService.success('Widget duplicated');
  }

  onWidgetClick(widget: GridItem): void {
    this.fullscreenWidget = widget;
  }

  onChartDateRangeClick(data: { chartId: string; range: any }): void {
    const { chartId, range } = data;
    this.chartDateRanges[chartId] = range;
    console.log('Chart date range updated:', chartId, range);
  }

  // ─── AI Chart Modal ───────────────────────────────────────────────────────────

  openAiChat(): void {
    this.isAiChatOpen = true;
  }

  closeAiChat(): void {
    this.isAiChatOpen = false;
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

      this.dashboardState.addWidget(newItem);
      this.isGenerating = false;
      this.isAiChatOpen = false;
    }, 3000);
  }

  // ─── Edit AI Modal ────────────────────────────────────────────────────────────

  onEditWithAI(widget: GridItem): void {
    this.editingWidget = widget;
    this.showEditAiModal = true;
  }

  onSaveEditedWidget(updatedWidget: GridItem): void {
    this.dashboardState.updateWidget(updatedWidget);
    this.toastService.success('Widget updated successfully!');
    this.showEditAiModal = false;
    this.editingWidget = null;
  }

  closeEditAiModal(): void {
    this.showEditAiModal = false;
    this.editingWidget = null;
  }

  // ─── Fullscreen ───────────────────────────────────────────────────────────────

  closeFullscreen(): void {
    this.fullscreenWidget = null;
  }

  // ─── Chatbot ──────────────────────────────────────────────────────────────────

  toggleChatbot(): void {
    this.isChatbotOpen = !this.isChatbotOpen;

    // Update context when opening
    if (this.isChatbotOpen) {
      this.chatService.setContext({ currentDashboardId: this.currentDashboardId });
    }
  }

  onCreateDashboardFromChat(data: { templateId: string; name: string }): void {
    // Get template from service
    const template: DashboardTemplate | undefined = this.templateService.getTemplateById(
      data.templateId,
    );

    if (template && template.widgets) {
      // Map widgets with unique IDs for the new dashboard
      const newWidgets: GridItem[] = template.widgets.map((widget, index) => ({
        ...widget,
        id: `new-${Date.now()}-${index}`,
        colStart: widget.colStart ?? 0,
        rowStart: widget.rowStart ?? index,
      }));

      const newDashboardId = this.dashboardState.createDashboard(newWidgets);
      console.log('New dashboard created:', newDashboardId, 'with', newWidgets.length, 'widgets');

      // Navigate to the new dashboard
      this.router.navigate(['/dashboard', newDashboardId]);
      this.toastService.success(`Created ${data.name} dashboard!`);
    }
  }

  onAddChartFromChat(data: {
    dashboardId: string | null;
    chartPrompt: string;
    chartTitle: string;
  }): void {
    const newChart: GridItem = {
      id: Date.now().toString(),
      type: 'chart',
      title: data.chartTitle,
      prompt: data.chartPrompt,
      chartData: {},
      colSpan: 6,
      rowSpan: 3,
      colStart: 0,
      rowStart: 0,
    };

    // If dashboardId is null, create a new dashboard with just this chart
    if (data.dashboardId === null) {
      const newDashboardId = this.dashboardState.createDashboard([newChart]);
      console.log('Created new dashboard with chart:', newDashboardId);
      this.router.navigate(['/dashboard', newDashboardId]);
      this.toastService.success(`Created new dashboard with "${data.chartTitle}" chart!`);
    } else if (data.dashboardId === this.currentDashboardId) {
      // Add to current dashboard
      this.undoRedoService.saveState(this.gridItems, 'Chart added');

      // Set proper row position
      newChart.rowStart =
        this.gridItems.length > 0
          ? Math.max(...this.gridItems.map((i) => (i.rowStart ?? 0) + i.rowSpan))
          : 0;

      this.dashboardState.addWidget(newChart);
      this.toastService.success(`Added "${data.chartTitle}" to dashboard!`);
    } else {
      // Add to a different (non-active) dashboard
      this.dashboardState.addWidgetToDashboard(data.dashboardId, newChart);
      this.toastService.success(`Added "${data.chartTitle}" to dashboard!`);
    }
  }

  getDashboardsList(): DashboardInfo[] {
    return this.dashboardState.getDashboardsList();
  }
}
