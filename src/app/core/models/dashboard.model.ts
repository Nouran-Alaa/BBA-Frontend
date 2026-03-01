export type WidgetType = 'chart' | 'countBox';

export interface WidgetPosition {
  widgetId: string;
  type: WidgetType;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string; // Optional dashboard description
  iconId: string; // Changed from 'icon' - now stores icon ID like 'layout-dashboard'
  companyId: string;
  createdBy: string;
  widgets: WidgetPosition[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
