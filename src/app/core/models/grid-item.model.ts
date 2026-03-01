/**
 * grid-item.model.ts
 * Place at: src/app/core/models/grid-item.model.ts
 */
export interface GridItem {
  id: string;
  type: 'chart' | 'count' | 'summary' | 'calculation' | 'news' | 'video';
  title: string;
  colSpan: number;
  rowSpan: number;
  colStart?: number;
  rowStart?: number;

  // ── chart ──────────────────────────────────────────────────────────────
  chartType?: string;
  prompt?: string; // optional AI prompt / description
  chartData?: any; // optional raw data payload for the chart

  // ── count (ECharts KPI gauge) ──────────────────────────────────────────
  value?: number;
  label?: string;
  countMax?: number;
  countColor?: string;

  // ── summary ────────────────────────────────────────────────────────────
  content?: string;

  // ── calculation ────────────────────────────────────────────────────────
  calcFormula?: 'sum' | 'average' | 'max' | 'min' | 'count';
  calcValues?: number[];
  calcUnit?: string;

  // ── news / video ───────────────────────────────────────────────────────
  newsConfig?: any;
  videoConfig?: any;
}
