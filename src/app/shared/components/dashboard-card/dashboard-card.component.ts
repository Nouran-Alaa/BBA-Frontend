/**
 * dashboard-card.component.ts  v4
 * Place at: src/app/shared/components/dashboard-card/dashboard-card.component.ts
 *
 * Key changes from v3:
 *  - Subscribes to ThemeService changes so charts re-render when mode switches
 *  - Count card now uses countKpiChart() (ECharts arc gauge) instead of raw HTML number
 *  - countKpiOption built from GridItem.value + GridItem.label
 */
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';
import { LucideAngularModule, TrendingUp, Sigma, BarChart2 } from 'lucide-angular';
import type { EChartsOption } from 'echarts';
import { Subscription } from 'rxjs';

import { GridItem } from '../../../core/models/grid-item.model';
import { NewsWidgetComponent } from '../widgets/news-widget/news-widget.component';
import { VideoWidgetComponent } from '../widgets/video-widget/video-widget.component';
import {
  getChartOption,
  countKpiChart,
  DashboardChartType,
  PALETTE,
} from '../../../core/data/chart-config';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  imports: [
    CommonModule,
    NgxEchartsDirective,
    LucideAngularModule,
    NewsWidgetComponent,
    VideoWidgetComponent,
  ],
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.css'],
})
export class DashboardCardComponent implements OnInit, OnChanges, OnDestroy {
  @Input() item!: GridItem;
  @Input() isEditMode = false;

  chartOption: EChartsOption = {};
  countKpiOption: EChartsOption = {};

  readonly initOpts = { renderer: 'canvas' as const };

  icons = { TrendingUp, Sigma, BarChart2 };

  private themeSub?: Subscription;

  constructor(public themeService: ThemeService) {}

  ngOnInit(): void {
    // Re-build chart options whenever the theme toggles dark ↔ light
    this.themeSub = this.themeService.isDark$.subscribe(() => {
      this.buildChartOptions();
    });
  }

  ngOnChanges(_: SimpleChanges): void {
    this.buildChartOptions();
  }

  ngOnDestroy(): void {
    this.themeSub?.unsubscribe();
  }

  private buildChartOptions(): void {
    const dark = this.themeService.isDark;

    if (this.item?.type === 'chart' && this.item?.chartType) {
      this.chartOption = getChartOption(this.item.chartType as DashboardChartType, dark);
    }

    if (this.item?.type === 'count') {
      this.countKpiOption = countKpiChart({
        value: this.item.value ?? 0,
        label: this.item.label ?? this.item.title ?? '',
        max: this.item.countMax, // optional ceiling — undefined = auto-scale
        color: this.item.countColor ?? PALETTE.primary,
        dark,
      });
    }
  }

  // ── Calculation widget helpers ───────────────────────────────────────────
  get calcResult(): number {
    const vals: number[] = this.item?.calcValues ?? [];
    if (!vals.length) return 0;
    switch (this.item?.calcFormula) {
      case 'sum':
        return vals.reduce((a: number, b: number) => a + b, 0);
      case 'average':
        return Math.round(vals.reduce((a: number, b: number) => a + b, 0) / vals.length);
      case 'max':
        return Math.max(...vals);
      case 'min':
        return Math.min(...vals);
      case 'count':
        return vals.length;
      default:
        return vals.reduce((a: number, b: number) => a + b, 0);
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
    return map[this.item?.calcFormula ?? 'sum'] ?? 'Total';
  }
}
