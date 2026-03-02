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
  type:'count-card' | 'chart' | 'news' | 'video' ;
  title: string;
  content?: any;

  
 // ── Count Card ──────────────────────────────────────────────────────────
  /** Headline number. Auto-formats: 39571 → "39.6K", 1580000 → "1.6M". */
  cardValue?: number | string;
  /** Small label above the number, e.g. "All Posts". */
  cardSubtitle?: string;
   /** Optional short description shown between subtitle and number. */
  cardDescription?: string;
  /** Optional platform icon URL. Hidden when omitted. */
  cardLogoUrl?: string;
  /** Change value. Negative = red ↓, positive = green ↑, 0 = neutral —. Omit to hide. */
  cardChange?: number;
  /** Unit for cardChange. Defaults to '%'. */
  cardChangeUnit?: string;
  /** Hex for the headline number. Defaults to var(--accent-primary). */
  cardAccentColor?: string;

  // ── Chart ─────────────────────────────────────────────────────────────────
  prompt?: string;
  chartType?: AnyChartType;
  chartData?: any;


  // ── News / Video ──────────────────────────────────────────────────────────
  newsConfig?: NewsWidgetConfig;
  videoConfig?: VideoWidgetConfig;

  // ── Grid position ─────────────────────────────────────────────────────────
  colSpan: number;
  rowSpan: number;
  colStart?: number;
  rowStart?: number;
}
