import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  preview: string; // Preview image or representation
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

  selectedTemplatePreview: DashboardTemplate | null = null;

  templates: DashboardTemplate[] = [
    {
      id: 'blank',
      name: 'Blank Dashboard',
      description: 'Start from scratch with an empty dashboard and build your own custom layout',
      icon: '📄',
      category: 'Basic',
      preview: 'blank',
      widgets: [],
    },
    {
      id: 'social-media',
      name: 'Social Media Analytics',
      description: 'Track engagement, reach, and followers across all social platforms',
      icon: '📱',
      category: 'Marketing',
      preview: 'social',
      widgets: [
        {
          type: 'count',
          title: 'Total Followers',
          value: 24568,
          label: 'followers',
          colSpan: 3,
          rowSpan: 1,
        },
        { type: 'count', title: 'Engagement Rate', value: 4.8, label: '%', colSpan: 3, rowSpan: 1 },
        {
          type: 'count',
          title: 'Total Reach',
          value: 156200,
          label: 'users',
          colSpan: 3,
          rowSpan: 1,
        },
        {
          type: 'count',
          title: 'Posts This Month',
          value: 342,
          label: 'posts',
          colSpan: 3,
          rowSpan: 1,
        },
        {
          type: 'chart',
          title: 'Engagement Over Time',
          prompt: 'Show social media engagement trends over the last 30 days',
          colSpan: 6,
          rowSpan: 3,
        },
        {
          type: 'chart',
          title: 'Platform Comparison',
          prompt: 'Compare follower growth across Facebook, Instagram, and Twitter',
          colSpan: 6,
          rowSpan: 3,
        },
      ],
    },
    {
      id: 'youtube',
      name: 'YouTube Analytics',
      description: 'Monitor views, subscribers, watch time and video performance metrics',
      icon: '📹',
      category: 'Content',
      preview: 'youtube',
      widgets: [
        {
          type: 'count',
          title: 'Total Views',
          value: 1250000,
          label: 'views',
          colSpan: 3,
          rowSpan: 1,
        },
        {
          type: 'count',
          title: 'Subscribers',
          value: 45300,
          label: 'subscribers',
          colSpan: 3,
          rowSpan: 1,
        },
        {
          type: 'count',
          title: 'Watch Time',
          value: 12500,
          label: 'hours',
          colSpan: 3,
          rowSpan: 1,
        },
        {
          type: 'count',
          title: 'Videos Published',
          value: 156,
          label: 'videos',
          colSpan: 3,
          rowSpan: 1,
        },
        {
          type: 'chart',
          title: 'Views & Watch Time Trend',
          prompt: 'Show YouTube views and watch time trends for the last 90 days',
          colSpan: 8,
          rowSpan: 3,
        },
        {
          type: 'chart',
          title: 'Top Performing Videos',
          prompt: 'Display top 10 videos by views in the last month',
          colSpan: 4,
          rowSpan: 3,
        },
      ],
    },
    {
      id: 'instagram',
      name: 'Instagram Insights',
      description: 'Analyze stories, reels, posts, and profile engagement metrics',
      icon: '📸',
      category: 'Social',
      preview: 'instagram',
      widgets: [
        {
          type: 'count',
          title: 'Profile Visits',
          value: 15600,
          label: 'visits',
          colSpan: 4,
          rowSpan: 1,
        },
        {
          type: 'count',
          title: 'Story Views',
          value: 8900,
          label: 'views',
          colSpan: 4,
          rowSpan: 1,
        },
        {
          type: 'count',
          title: 'Reel Plays',
          value: 125000,
          label: 'plays',
          colSpan: 4,
          rowSpan: 1,
        },
        {
          type: 'chart',
          title: 'Content Performance',
          prompt: 'Compare engagement rates between posts, stories, and reels',
          colSpan: 6,
          rowSpan: 3,
        },
        {
          type: 'chart',
          title: 'Follower Growth',
          prompt: 'Show Instagram follower growth and demographics over 3 months',
          colSpan: 6,
          rowSpan: 3,
        },
      ],
    },
    {
      id: 'facebook',
      name: 'Facebook Page Analytics',
      description: 'Track page likes, post reach, engagement and audience demographics',
      icon: '📘',
      category: 'Social',
      preview: 'facebook',
      widgets: [
        {
          type: 'count',
          title: 'Page Likes',
          value: 32400,
          label: 'likes',
          colSpan: 3,
          rowSpan: 1,
        },
        {
          type: 'count',
          title: 'Post Reach',
          value: 89500,
          label: 'people',
          colSpan: 3,
          rowSpan: 1,
        },
        {
          type: 'count',
          title: 'Engagement',
          value: 5600,
          label: 'interactions',
          colSpan: 3,
          rowSpan: 1,
        },
        {
          type: 'count',
          title: 'Page Views',
          value: 12300,
          label: 'views',
          colSpan: 3,
          rowSpan: 1,
        },
        {
          type: 'chart',
          title: 'Reach & Engagement',
          prompt: 'Display Facebook page reach and engagement metrics for last 60 days',
          colSpan: 7,
          rowSpan: 3,
        },
        {
          type: 'chart',
          title: 'Audience Demographics',
          prompt: 'Show Facebook audience breakdown by age, gender, and location',
          colSpan: 5,
          rowSpan: 3,
        },
      ],
    },
    {
      id: 'executive',
      name: 'Executive Summary',
      description: 'High-level overview with KPIs, trends and strategic insights',
      icon: '📊',
      category: 'Business',
      preview: 'executive',
      widgets: [
        {
          type: 'summary',
          title: 'Executive Summary',
          content:
            'Q4 performance shows 23% growth in digital engagement. Social media reach increased by 45K users, with Instagram leading at 18K new followers. YouTube watch time up 2.1K hours. Overall engagement rate improved to 4.8%, exceeding quarterly target of 4.2%.',
          colSpan: 12,
          rowSpan: 2,
        },
        {
          type: 'chart',
          title: 'Key Metrics Overview',
          prompt: 'Dashboard showing all key performance indicators and their trends',
          colSpan: 8,
          rowSpan: 3,
        },
        {
          type: 'chart',
          title: 'Monthly Performance',
          prompt: 'Month-over-month comparison of all major metrics',
          colSpan: 4,
          rowSpan: 3,
        },
      ],
    },
    {
      id: 'twitter',
      name: 'Twitter (X) Analytics',
      description: 'Monitor tweets, impressions, engagement and follower growth',
      icon: '🐦',
      category: 'Social',
      preview: 'twitter',
      widgets: [
        {
          type: 'count',
          title: 'Tweet Impressions',
          value: 245000,
          label: 'impressions',
          colSpan: 3,
          rowSpan: 1,
        },
        {
          type: 'count',
          title: 'Profile Visits',
          value: 8900,
          label: 'visits',
          colSpan: 3,
          rowSpan: 1,
        },
        {
          type: 'count',
          title: 'Mentions',
          value: 1240,
          label: 'mentions',
          colSpan: 3,
          rowSpan: 1,
        },
        {
          type: 'count',
          title: 'New Followers',
          value: 450,
          label: 'followers',
          colSpan: 3,
          rowSpan: 1,
        },
        {
          type: 'chart',
          title: 'Tweet Performance',
          prompt: 'Show top tweets by engagement in the last 30 days',
          colSpan: 6,
          rowSpan: 3,
        },
        {
          type: 'chart',
          title: 'Engagement Timeline',
          prompt: 'Display Twitter engagement trends and optimal posting times',
          colSpan: 6,
          rowSpan: 3,
        },
      ],
    },
    {
      id: 'tiktok',
      name: 'TikTok Analytics',
      description: 'Track video views, likes, shares and trending content performance',
      icon: '🎵',
      category: 'Content',
      preview: 'tiktok',
      widgets: [
        {
          type: 'count',
          title: 'Video Views',
          value: 2450000,
          label: 'views',
          colSpan: 3,
          rowSpan: 1,
        },
        { type: 'count', title: 'Likes', value: 145000, label: 'likes', colSpan: 3, rowSpan: 1 },
        { type: 'count', title: 'Shares', value: 12400, label: 'shares', colSpan: 3, rowSpan: 1 },
        {
          type: 'count',
          title: 'Comments',
          value: 8900,
          label: 'comments',
          colSpan: 3,
          rowSpan: 1,
        },
        {
          type: 'chart',
          title: 'Viral Content Analysis',
          prompt: 'Identify viral TikTok videos and trending patterns',
          colSpan: 7,
          rowSpan: 3,
        },
        {
          type: 'chart',
          title: 'Audience Growth',
          prompt: 'Show TikTok follower growth and audience demographics',
          colSpan: 5,
          rowSpan: 3,
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

  showPreview(template: DashboardTemplate): void {
    this.selectedTemplatePreview = template;
  }

  closePreview(): void {
    this.selectedTemplatePreview = null;
  }

  getFilteredTemplates(): DashboardTemplate[] {
    if (this.selectedCategory === 'All') {
      return this.templates;
    }
    return this.templates.filter((t) => t.category === this.selectedCategory);
  }
}
