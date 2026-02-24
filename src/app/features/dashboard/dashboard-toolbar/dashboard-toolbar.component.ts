import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DateRangePickerComponent,
  DateRange,
} from '../../../shared/components/action_menus/date-range-picker/date-range-picker.component';

@Component({
  selector: 'app-dashboard-toolbar',
  standalone: true,
  imports: [CommonModule, DateRangePickerComponent],
  templateUrl: './dashboard-toolbar.component.html',
  styleUrls: ['./dashboard-toolbar.component.css'],
})
export class DashboardToolbarComponent {
  @ViewChild('datePickerContainer') datePickerContainer?: ElementRef;

  // ─── Inputs ──────────────────────────────────────────────────────────────────
  @Input() isEditMode: boolean = false;
  @Input() canUndo: boolean = false;
  @Input() canRedo: boolean = false;

  // ─── Outputs ─────────────────────────────────────────────────────────────────
  @Output() editModeToggle = new EventEmitter<void>();
  @Output() undoClick = new EventEmitter<void>();
  @Output() redoClick = new EventEmitter<void>();
  @Output() dateRangeChange = new EventEmitter<DateRange>();

  // ─── Internal State ───────────────────────────────────────────────────────────
  isDatePickerOpen: boolean = false;
  currentDateRange: DateRange | null = null;

  // ─── Date Picker ─────────────────────────────────────────────────────────────

  toggleDatePicker(): void {
    this.isDatePickerOpen = !this.isDatePickerOpen;
  }

  onDateRangeChange(range: DateRange): void {
    this.currentDateRange = range;
    this.isDatePickerOpen = false;
    this.dateRangeChange.emit(range);
  }

  getFormattedDateRange(): string {
    if (!this.currentDateRange) return 'Select Date Range';
    const start = new Date(this.currentDateRange.startDate);
    const end = new Date(this.currentDateRange.endDate);
    return `${this.formatDate(start)} - ${this.formatDate(end)}`;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // ─── Click Outside (date picker) ─────────────────────────────────────────────

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isDatePickerOpen && this.datePickerContainer) {
      const clickedInside = this.datePickerContainer.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.isDatePickerOpen = false;
      }
    }
  }
}
