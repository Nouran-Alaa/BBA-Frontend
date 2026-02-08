import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  widgets: any[];
}

@Component({
  selector: 'app-dashboard-templates-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-templates-modal.component.html',
  styleUrls: ['./dashboard-templates-modal.component.css'],
})
export class DashboardTemplatesModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() selectTemplate = new EventEmitter<DashboardTemplate | null>();

  templates: DashboardTemplate[] = [
    {
      id: 'blank',
      name: 'Blank Dashboard',
      description: 'Start from scratch with an empty dashboard',
      icon: '📄',
      category: 'Basic',
      widgets: [],
    },
    {
      id: 'social-media',
      name: 'Social Media Analytics',
      description: 'Track engagement, reach, and followers across platforms',
      icon: '📱',
      category: 'Marketing',
      widgets: [
        {
          type: 'count',
          title: 'Total Followers',
          value: 0,
          label: 'followers',
          colSpan: 3,
          rowSpan: 1,
        },
        { type: 'count', title: 'Engagement Rate', value: 0, label: '%', colSpan: 3, rowSpan: 1 },
        { type: 'count', title: 'Total Reach', value: 0, label: 'users', colSpan: 3, rowSpan: 1 },
        {
          type: 'count',
          title: 'Posts This Month',
          value: 0,
          label: 'posts',
          colSpan: 3,
          rowSpan: 1,
        },
      ],
    },
    {
      id: 'youtube',
      name: 'YouTube Analytics',
      description: 'Monitor views, subscribers, and video performance',
      icon: '📹',
      category: 'Content',
      widgets: [
        { type: 'count', title: 'Total Views', value: 0, label: 'views', colSpan: 3, rowSpan: 1 },
        {
          type: 'count',
          title: 'Subscribers',
          value: 0,
          label: 'subscribers',
          colSpan: 3,
          rowSpan: 1,
        },
        { type: 'count', title: 'Watch Time', value: 0, label: 'hours', colSpan: 3, rowSpan: 1 },
        {
          type: 'count',
          title: 'Videos Published',
          value: 0,
          label: 'videos',
          colSpan: 3,
          rowSpan: 1,
        },
      ],
    },
    {
      id: 'instagram',
      name: 'Instagram Insights',
      description: 'Analyze stories, reels, and post performance',
      icon: '📸',
      category: 'Social',
      widgets: [
        {
          type: 'count',
          title: 'Profile Visits',
          value: 0,
          label: 'visits',
          colSpan: 4,
          rowSpan: 1,
        },
        { type: 'count', title: 'Story Views', value: 0, label: 'views', colSpan: 4, rowSpan: 1 },
        { type: 'count', title: 'Reel Plays', value: 0, label: 'plays', colSpan: 4, rowSpan: 1 },
      ],
    },
    {
      id: 'facebook',
      name: 'Facebook Page Analytics',
      description: 'Track page likes, post reach, and engagement',
      icon: '📘',
      category: 'Social',
      widgets: [
        { type: 'count', title: 'Page Likes', value: 0, label: 'likes', colSpan: 3, rowSpan: 1 },
        { type: 'count', title: 'Post Reach', value: 0, label: 'people', colSpan: 3, rowSpan: 1 },
        {
          type: 'count',
          title: 'Engagement',
          value: 0,
          label: 'interactions',
          colSpan: 3,
          rowSpan: 1,
        },
        { type: 'count', title: 'Page Views', value: 0, label: 'views', colSpan: 3, rowSpan: 1 },
      ],
    },
    {
      id: 'executive',
      name: 'Executive Summary',
      description: 'High-level overview with key metrics and insights',
      icon: '📊',
      category: 'Business',
      widgets: [
        {
          type: 'summary',
          title: 'Executive Summary',
          content: 'Overview of key business metrics',
          colSpan: 12,
          rowSpan: 2,
        },
      ],
    },
  ];

  selectedCategory: string = 'All';
  categories: string[] = ['All', 'Basic', 'Marketing', 'Social', 'Content', 'Business'];

  onClose(): void {
    this.close.emit();
  }

  onSelectTemplate(template: DashboardTemplate): void {
    this.selectTemplate.emit(template);
  }

  getFilteredTemplates(): DashboardTemplate[] {
    if (this.selectedCategory === 'All') {
      return this.templates;
    }
    return this.templates.filter((t) => t.category === this.selectedCategory);
  }
}
