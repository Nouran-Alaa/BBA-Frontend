import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardTemplateService {
  private templateWidgetsSubject = new BehaviorSubject<any[] | null>(null);
  templateWidgets$ = this.templateWidgetsSubject.asObservable();

  setTemplateWidgets(widgets: any[]): void {
    this.templateWidgetsSubject.next(widgets);
  }

  clearTemplateWidgets(): void {
    this.templateWidgetsSubject.next(null);
  }
}
