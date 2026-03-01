/**
 * fullscreen-widget-modal.component.ts
 * Place at: src/app/shared/components/modals/fullscreen-widget-modal/fullscreen-widget-modal.component.ts
 *
 * Changes from original:
 *  - Added NgxEchartsDirective to imports
 *  - Builds chartOption from getChartOption() / countKpiChart() on init
 *  - Added calcResult / calcLabel helpers (mirrors dashboard-card)
 *  - Theme and animations untouched
 */
import { Component, Input, Output, EventEmitter, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

import { GridItem } from '../../../../core/models/grid-item.model';
import {
  getChartOption,
  countKpiChart,
  DashboardChartType,
  PALETTE,
} from '../../../../core/data/chart-config';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-fullscreen-widget-modal',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  templateUrl: './fullscreen-widget-modal.component.html',
  styleUrls: ['./fullscreen-widget-modal.component.css'],
})
export class FullscreenWidgetModalComponent implements OnInit {
  @Input() widget!: GridItem;
  @Output() close = new EventEmitter<void>();

  chartOption: EChartsOption = {};
  readonly initOpts = { renderer: 'canvas' as const };

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    const dark = this.themeService.isDark;

    if (this.widget?.type === 'chart' && this.widget?.chartType) {
      this.chartOption = getChartOption(this.widget.chartType as DashboardChartType, dark);
    }

    if (this.widget?.type === 'count') {
      this.chartOption = countKpiChart({
        value: this.widget.value ?? 0,
        label: this.widget.label ?? this.widget.title ?? '',
        max: this.widget.countMax,
        color: this.widget.countColor ?? PALETTE.primary,
        dark,
      });
    }
  }

  onClose(): void {
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.onClose();
  }

  get calcResult(): number {
    const vals = this.widget?.calcValues ?? [];
    if (!vals.length) return 0;
    switch (this.widget?.calcFormula) {
      case 'sum':
        return vals.reduce((a, b) => a + b, 0);
      case 'average':
        return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      case 'max':
        return Math.max(...vals);
      case 'min':
        return Math.min(...vals);
      case 'count':
        return vals.length;
      default:
        return vals.reduce((a, b) => a + b, 0);
    }
  }

  get calcLabel(): string {
    const map: Record<string, string> = {
      sum: 'Total',
      average: 'Average',
      max: 'Maximum',
      min: 'Minimum',
      count: 'Count',
    };
    return map[this.widget?.calcFormula ?? 'sum'] ?? 'Total';
  }
}
