import { NewsWidgetConfig } from './news-widget.model';
import { VideoWidgetConfig } from './video-widget.model';

export interface GridItem {
  id: string;
  type: 'summary' | 'count' | 'chart' | 'news' | 'video';
  title: string;
  content?: any;
  value?: number;
  label?: string;
  prompt?: string;
  chartData?: any;
  newsConfig?: NewsWidgetConfig; // populated when type === 'news'
  videoConfig?: VideoWidgetConfig; // populated when type === 'video'
  colSpan: number;
  rowSpan: number;
  colStart?: number;
  rowStart?: number;
}
