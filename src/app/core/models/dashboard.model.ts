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
  companyId: string;
  createdBy: string;
  widgets: WidgetPosition[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  description?: string; // Optional dashboard description
  icon?: string; // Icon for the dashboard in the sidebar list
}
