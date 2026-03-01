import { NewsWidgetConfig } from './news-widget.model';
import { VideoWidgetConfig } from './video-widget.model';
import { DashboardChartType } from '../data/chart-config';

/**
 * Legacy chart type alias used by the original chart-mock-data service.
 * Defined inline here so we don't depend on chart-mock-data.ts existing.
 */
export type LegacyChartType =
  | 'area'
  | 'bar'
  | 'donut'
  | 'horizontal-bar'
  | 'radar'
  | 'stacked-area'
  | 'scatter';

/** All supported chart type identifiers across old and new chart systems. */
export type AnyChartType = LegacyChartType | DashboardChartType;

export interface GridItem {
  id: string;
  type: 'summary' | 'count' | 'chart' | 'news' | 'video' | 'calculation';
  title: string;
  content?: any;

  // ── Count / KPI arc-gauge ─────────────────────────────────────────────────
  value?: number;
  label?: string;
  /** KPI arc-gauge: upper bound for the progress arc. Auto-scales when omitted. */
  countMax?: number;
  /** KPI arc-gauge: accent colour hex. Defaults to PALETTE.primary. */
  countColor?: string;

  // ── Chart ─────────────────────────────────────────────────────────────────
  prompt?: string;
  /** Accepts both legacy ChartType and the newer DashboardChartType tokens. */
  chartType?: AnyChartType;
  chartData?: any;

  // ── Calculation widget ────────────────────────────────────────────────────
  calcUnit?: string;
  calcValues?: number[];
  calcFormula?: 'sum' | 'average' | 'min' | 'max' | 'count';

  // ── News / Video ──────────────────────────────────────────────────────────
  newsConfig?: NewsWidgetConfig;
  videoConfig?: VideoWidgetConfig;

  // ── Grid position ─────────────────────────────────────────────────────────
  colSpan: number;
  rowSpan: number;
  colStart?: number;
  rowStart?: number;
}
