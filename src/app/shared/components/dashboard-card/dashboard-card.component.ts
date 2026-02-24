import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridItem } from '../dashboard-grid/dashboard-grid.component';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.css'],
})
export class DashboardCardComponent {
  @Input() item!: GridItem;
  @Input() isEditMode: boolean = false;

  getSummaryIcon(): string {
    return '✨';
  }

  getChartIcon(): string {
    return '🤖';
  }
}
