/**
 * dashboard-card.component.ts  v5
 * Place at: src/app/shared/components/dashboard-card/dashboard-card.component.ts
 *
 * Changes from v4:
 *  - Removed 'count' (KPI arc-gauge), 'calculation', 'summary' widget types
 *  - Added 'count-card' (styled stat box — title + big number + logo + change)
 *  - Removed countKpiChart, PALETTE, calcResult, calcLabel, countKpiOption
 *  - Added formatCardValue() helper (auto-formats large numbers)
 */
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';
import { LucideAngularModule, TrendingUp, BarChart2 } from 'lucide-angular';
import type { EChartsOption } from 'echarts';
import { Subscription } from 'rxjs';

import { GridItem } from '../../../core/models/grid-item.model';
import { NewsWidgetComponent } from '../widgets/news-widget/news-widget.component';
import { VideoWidgetComponent } from '../widgets/video-widget/video-widget.component';
import { getChartOption, DashboardChartType } from '../../../core/data/chart-config';
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
  readonly initOpts = { renderer: 'canvas' as const };

  icons = { TrendingUp, BarChart2 };

  private themeSub?: Subscription;

  constructor(public themeService: ThemeService) {}

  ngOnInit(): void {
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
  }

  // ── Count-card helpers ───────────────────────────────────────────────────
  formatCardValue(v: number | string | undefined): string {
    if (v === undefined || v === null) return '—';
    if (typeof v === 'string') return v;
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (v >= 1_000) return (v / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return v.toLocaleString();
  }
}
