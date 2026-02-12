import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TemplateData {
  dashboardId: string;
  widgets: any[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardTemplateService {
  private templateDataSubject = new BehaviorSubject<TemplateData | null>(null);
  templateData$ = this.templateDataSubject.asObservable();

  setTemplateWidgets(dashboardId: string, widgets: any[]): void {
    this.templateDataSubject.next({ dashboardId, widgets });
  }

  clearTemplateWidgets(): void {
    this.templateDataSubject.next(null);
  }
}
