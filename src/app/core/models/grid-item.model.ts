export interface GridItem {
  id: string;
  type: 'summary' | 'count' | 'chart';
  title: string;
  content?: any;
  value?: number;
  label?: string;
  prompt?: string;
  chartData?: any;
  colSpan: number;
  rowSpan: number;
  colStart?: number;
  rowStart?: number;
}
