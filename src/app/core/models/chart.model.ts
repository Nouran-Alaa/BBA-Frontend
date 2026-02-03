export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'scatter';
export type ChartDimension = '2d' | '3d';

export interface Dataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

export interface AxisConfig {
  label?: string;
  show?: boolean;
  min?: number;
  max?: number;
  type?: 'value' | 'category' | 'time' | 'log'; // ECharts axis types
}

export interface Chart {
  id: string;
  dashboardId: string;
  title: string;
  chartType: ChartType;
  chartDimension: ChartDimension;
  data: ChartData;
  xAxisConfig?: AxisConfig;
  yAxisConfig?: AxisConfig;
  colors?: string[];
  customOptions?: Record<string, any>;

  showLegend?: boolean; // Toggle legend visibility
  showTooltip?: boolean; // Toggle tooltip on hover
  animationDuration?: number; // Animation speed in ms
}
