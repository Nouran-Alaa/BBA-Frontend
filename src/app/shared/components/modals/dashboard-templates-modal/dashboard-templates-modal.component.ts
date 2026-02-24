import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DashboardTemplateService,
  DashboardTemplate,
} from '../../../../core/services/dashboard-template.service';

@Component({
  selector: 'app-dashboard-templates-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-templates-modal.component.html',
  styleUrls: ['./dashboard-templates-modal.component.css'],
})
export class DashboardTemplatesModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() selectTemplate = new EventEmitter<DashboardTemplate | null>();

  selectedTemplatePreview: DashboardTemplate | null = null;
  searchQuery: string = '';
  templates: DashboardTemplate[] = [];
  selectedCategory: string = 'All';
  categories: string[] = ['All', 'Basic', 'Marketing', 'Social', 'Content', 'Business'];

  constructor(private templateService: DashboardTemplateService) {}

  ngOnInit(): void {
    // Get templates from centralized service
    this.templates = this.templateService.getTemplates();
  }

  onClose(): void {
    this.close.emit();
  }

  onSelectTemplate(template: DashboardTemplate): void {
    this.selectTemplate.emit(template);
  }

  showPreview(template: DashboardTemplate): void {
    this.selectedTemplatePreview = template;
  }

  closePreview(): void {
    this.selectedTemplatePreview = null;
  }

  getWidgetGridClasses(widget: any): string {
    const colSpan = widget.colSpan;
    const rowSpan = widget.rowSpan;

    // Mobile: Full width (1 col)
    // Small: Half width (2 cols max)
    // Medium: Quarter width (4 cols max)
    // Large: Original width (12 cols)

    let classes = `row-span-${rowSpan} `;

    // Mobile - always full width
    classes += 'col-span-1 ';

    // Small screens (sm) - max 2 columns
    if (colSpan >= 6) {
      classes += 'sm:col-span-2 ';
    } else {
      classes += 'sm:col-span-1 ';
    }

    // Medium screens (md) - max 4 columns, scale proportionally
    if (colSpan >= 9) {
      classes += 'md:col-span-4 ';
    } else if (colSpan >= 6) {
      classes += 'md:col-span-3 ';
    } else if (colSpan >= 3) {
      classes += 'md:col-span-2 ';
    } else {
      classes += 'md:col-span-1 ';
    }

    // Large screens (lg) - original 12-column layout
    classes += `lg:col-span-${colSpan}`;

    return classes;
  }

  getFilteredTemplates(): DashboardTemplate[] {
    let filtered = this.templates;

    if (this.selectedCategory !== 'All') {
      filtered = filtered.filter((t) => t.category === this.selectedCategory);
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) => t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query),
      );
    }

    return filtered;
  }
}
