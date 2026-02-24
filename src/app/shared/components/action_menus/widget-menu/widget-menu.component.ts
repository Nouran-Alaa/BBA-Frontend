import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-widget-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './widget-menu.component.html',
  styleUrls: ['./widget-menu.component.css'],
})
export class WidgetMenuComponent {
  @Input() isOpen: boolean = false;
  @Output() duplicate = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() toggle = new EventEmitter<MouseEvent>();
}
