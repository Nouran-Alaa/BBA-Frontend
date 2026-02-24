import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../../core/services/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
})
export class ToastComponent implements OnInit {
  toasts$!: Observable<Toast[]>;

  constructor(public toastService: ToastService) {}

  ngOnInit(): void {
    this.toasts$ = this.toastService.toasts$;
  }

  getColor(type: string): string {
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      info: '#3b82f6',
      warning: '#f59e0b',
    };
    return colors[type as keyof typeof colors] || colors.info;
  }

  getIconBackground(type: string): string {
    const backgrounds = {
      success: 'rgba(16, 185, 129, 0.15)',
      error: 'rgba(239, 68, 68, 0.15)',
      info: 'rgba(59, 130, 246, 0.15)',
      warning: 'rgba(245, 158, 11, 0.15)',
    };
    return backgrounds[type as keyof typeof backgrounds] || backgrounds.info;
  }

  removeToast(id: number): void {
    this.toastService.remove(id);
  }
}
