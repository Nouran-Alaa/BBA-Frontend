import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateRangePickerComponent } from '../date-range-picker/date-range-picker.component';

@Component({
  selector: 'app-card-actions',
  standalone: true,
  imports: [CommonModule, DateRangePickerComponent],
  templateUrl: './card-actions.component.html',
  styleUrls: ['./card-actions.component.css'],
})
export class CardActionsComponent {
  @Input() itemId!: string;
  @Input() itemType!: string;
  @Input() isActive: boolean = false;
  @Input() datePickerPosition: { top: number; left: number } = { top: 0, left: 0 };

  @Output() editClick = new EventEmitter<MouseEvent>();
  @Output() dateClick = new EventEmitter<MouseEvent>();
  @Output() dateRangeChange = new EventEmitter<any>();
}
