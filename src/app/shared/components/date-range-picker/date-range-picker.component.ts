import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.css'],
})
export class DateRangePickerComponent {
  @Output() dateRangeChange = new EventEmitter<DateRange>();

  startDate: string = '';
  endDate: string = '';

  presetRanges = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 Days', value: 'last7days' },
    { label: 'Last 30 Days', value: 'last30days' },
    { label: 'This Month', value: 'thisMonth' },
    { label: 'Last Month', value: 'lastMonth' },
    { label: 'This Year', value: 'thisYear' },
    { label: 'Custom Range', value: 'custom' },
  ];

  selectedPreset: string = '';
  showCustomPicker: boolean = false;

  selectPreset(preset: string): void {
    this.selectedPreset = preset;
    this.showCustomPicker = preset === 'custom';

    if (preset !== 'custom') {
      const range = this.calculatePresetRange(preset);
      this.startDate = this.formatDate(range.startDate);
      this.endDate = this.formatDate(range.endDate);
      this.emitDateRange(range);
    }
  }

  calculatePresetRange(preset: string): DateRange {
    const today = new Date();
    const startDate = new Date();
    const endDate = new Date();

    switch (preset) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'yesterday':
        startDate.setDate(today.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(today.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'last7days':
        startDate.setDate(today.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'last30days':
        startDate.setDate(today.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'thisMonth':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'lastMonth':
        startDate.setMonth(today.getMonth() - 1, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(today.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'thisYear':
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      default:
        startDate.setDate(today.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  }

  onCustomDateChange(): void {
    if (this.startDate && this.endDate) {
      const range: DateRange = {
        startDate: new Date(this.startDate),
        endDate: new Date(this.endDate),
      };
      this.emitDateRange(range);
    }
  }

  emitDateRange(range: DateRange): void {
    this.dateRangeChange.emit(range);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
