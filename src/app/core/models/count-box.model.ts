export interface CountBoxTrend {
  percentage: number;
  isPositive: boolean;
}

export interface CountBox {
  id: string;
  dashboardId: string;
  label: string;
  value: number;
  icon: string;
  backgroundColor: string;
  textColor: string;
  dataSource: string;
  trend?: CountBoxTrend;
  updatedAt: Date;

  prefix?: string; // e.g., "$", "+"
  suffix?: string; // e.g., "%", "K", "M"
  animateOnChange?: boolean; // Animate when value updates
}
