import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { Subscription } from 'rxjs';
import {
  DashboardTemplateService,
  DashboardTemplate,
} from '../../../../core/services/dashboard-template.service';
import { DashboardIconService } from '../../../../core/services/dashboard-icon.service';
import {
  getChartOption,
  DashboardChartType,
  CHART_TYPE_LABELS,
} from '../../../../core/data/chart-config';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-dashboard-templates-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, NgxEchartsDirective],
  templateUrl: './dashboard-templates-modal.component.html',
  styleUrls: ['./dashboard-templates-modal.component.css'],
})
export class DashboardTemplatesModalComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();
  @Output() selectTemplate = new EventEmitter<DashboardTemplate | null>();

  selectedTemplatePreview: DashboardTemplate | null = null;
  searchQuery = '';
  templates: DashboardTemplate[] = [];
  selectedCategory = 'All';
  categories = ['All', 'Basic', 'Marketing', 'Social', 'Content', 'Business'];

  /** ECharts initOpts — canvas renderer, no extra height constraints */
  readonly initOpts = { renderer: 'canvas' as const };

  /** Cache chart options per type+theme so they aren't rebuilt on every CD cycle */
  private chartOptionCache = new Map<string, EChartsOption>();
  private themeSub?: Subscription;

  constructor(
    private templateService: DashboardTemplateService,
    public dashboardIconService: DashboardIconService,
    private themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.templates = this.templateService.getTemplates();
    // Clear cache when theme switches so previews re-render with correct colours
    this.themeSub = this.themeService.isDark$.subscribe(() => {
      this.chartOptionCache.clear();
    });
  }

  ngOnDestroy(): void {
    this.themeSub?.unsubscribe();
  }

  onClose(): void {
    this.close.emit();
  }

  onSelectTemplate(template: DashboardTemplate): void {
    this.selectTemplate.emit(template);
  }

  showPreview(template: DashboardTemplate): void {
    this.selectedTemplatePreview = template;
  }

  closePreview(): void {
    this.selectedTemplatePreview = null;
  }

  getFilteredTemplates(): DashboardTemplate[] {
    let filtered = this.templates;
    if (this.selectedCategory !== 'All') {
      filtered = filtered.filter((t) => t.category === this.selectedCategory);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
      );
    }
    return filtered;
  }

  /**
   * Returns up to 3 unique human-readable chart type labels for the card chips.
   * Shows 'Summary' if there's a summary widget.
   */
  getWidgetChips(template: DashboardTemplate): string[] {
    const seen = new Set<string>();
    for (const w of template.widgets) {
      if (w.type === 'chart' && w.chartType) {
        const label = CHART_TYPE_LABELS[w.chartType as DashboardChartType];
        if (label) seen.add(label);
      } else if (w.type === 'summary') {
        seen.add('Summary');
      }
      if (seen.size >= 3) break;
    }
    return Array.from(seen);
  }

  /** Returns the human-readable label for a DashboardChartType string. */
  getChartLabel(chartType: string): string {
    return CHART_TYPE_LABELS[chartType as DashboardChartType] ?? chartType;
  }

  /**
   * Returns a cached ECharts option for the preview grid.
   * Strips tooltip and animation so the preview renders instantly.
   */
  getPreviewChartOption(chartType: string): EChartsOption {
    const cacheKey = `${chartType}:${this.themeService.isDark ? 'dark' : 'light'}`;
    if (!this.chartOptionCache.has(cacheKey)) {
      const base = getChartOption(chartType as DashboardChartType, this.themeService.isDark);
      const opt: EChartsOption = { ...base, animation: false, tooltip: { show: false } };
      this.chartOptionCache.set(cacheKey, opt);
    }
    return this.chartOptionCache.get(cacheKey)!;
  }
}
