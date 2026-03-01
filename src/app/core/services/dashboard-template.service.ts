import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TemplateData {
  dashboardId: string;
  widgets: any[];
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  iconId: string;
  category: string;
  preview: string;
  widgets: any[];
  iconGradient?: string;
}

/**
 * All widgets use GridItem-compatible fields:
 *   type: 'chart' | 'summary'   (count widgets removed — replaced with real charts)
 *   chartType: DashboardChartType  (from chart-config.ts)
 *   colSpan / rowSpan / colStart / rowStart: 12-column grid
 */
@Injectable({ providedIn: 'root' })
export class DashboardTemplateService {
  private templateDataSubject = new BehaviorSubject<TemplateData | null>(null);
  templateData$ = this.templateDataSubject.asObservable();

  templates: DashboardTemplate[] = [
    // ── BLANK ────────────────────────────────────────────────────────────────
    {
      id: 'blank',
      name: 'Blank Dashboard',
      description: 'Start from scratch — empty canvas, build your own layout',
      iconId: 'layout-dashboard',
      category: 'Basic',
      preview: 'blank',
      iconGradient: 'linear-gradient(135deg, #00c8ff, #00e5cc)',
      widgets: [],
    },

    // ── SOCIAL MEDIA ANALYTICS ────────────────────────────────────────────────
    {
      id: 'social-media',
      name: 'Social Media Analytics',
      description: 'Track engagement, reach, sentiment and follower growth across all platforms',
      iconId: 'users',
      category: 'Marketing',
      preview: 'social',
      iconGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      widgets: [
        {
          id: 'sma-1',
          type: 'chart',
          chartType: 'dual-line-chart',
          title: 'Reach vs Impressions',
          colSpan: 6,
          rowSpan: 3,
          colStart: 0,
          rowStart: 0,
        },
        {
          id: 'sma-2',
          type: 'chart',
          chartType: 'line-chart',
          title: 'Engagement Trend',
          colSpan: 6,
          rowSpan: 3,
          colStart: 6,
          rowStart: 0,
        },
        {
          id: 'sma-3',
          type: 'chart',
          chartType: 'stacked-bar-chart',
          title: 'Audience by Age & Gender',
          colSpan: 4,
          rowSpan: 3,
          colStart: 0,
          rowStart: 3,
        },
        {
          id: 'sma-4',
          type: 'chart',
          chartType: 'donut-chart',
          title: 'Sentiment Breakdown',
          colSpan: 4,
          rowSpan: 3,
          colStart: 4,
          rowStart: 3,
        },
        {
          id: 'sma-5',
          type: 'chart',
          chartType: 'gauge-chart',
          title: 'Gender Split',
          colSpan: 4,
          rowSpan: 3,
          colStart: 8,
          rowStart: 3,
        },
      ],
    },

    // ── YOUTUBE ANALYTICS ─────────────────────────────────────────────────────
    {
      id: 'youtube',
      name: 'YouTube Analytics',
      description: 'Monitor views, subscribers, watch time, sentiment and video performance',
      iconId: 'youtube',
      category: 'Content',
      preview: 'youtube',
      iconGradient: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
      widgets: [
        {
          id: 'yt-1',
          type: 'chart',
          chartType: 'multi-line-chart',
          title: 'Subscriber Growth',
          colSpan: 8,
          rowSpan: 3,
          colStart: 0,
          rowStart: 0,
        },
        {
          id: 'yt-2',
          type: 'chart',
          chartType: 'rose-chart',
          title: 'Emotion Breakdown',
          colSpan: 4,
          rowSpan: 3,
          colStart: 8,
          rowStart: 0,
        },
        {
          id: 'yt-3',
          type: 'chart',
          chartType: 'bar-chart',
          title: 'Top Videos by Views',
          colSpan: 6,
          rowSpan: 3,
          colStart: 0,
          rowStart: 3,
        },
        {
          id: 'yt-4',
          type: 'chart',
          chartType: 'stacked-bar-chart',
          title: 'Viewer Demographics',
          colSpan: 3,
          rowSpan: 3,
          colStart: 6,
          rowStart: 3,
        },
        {
          id: 'yt-5',
          type: 'chart',
          chartType: 'donut-chart',
          title: 'Sentiment Distribution',
          colSpan: 3,
          rowSpan: 3,
          colStart: 9,
          rowStart: 3,
        },
      ],
    },

    // ── INSTAGRAM INSIGHTS ────────────────────────────────────────────────────
    {
      id: 'instagram',
      name: 'Instagram Insights',
      description: 'Stories, Reels, posts — engagement metrics and audience analysis',
      iconId: 'instagram',
      category: 'Social',
      preview: 'instagram',
      iconGradient:
        'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
      widgets: [
        {
          id: 'ig-1',
          type: 'chart',
          chartType: 'line-chart',
          title: 'Profile Visits Trend',
          colSpan: 6,
          rowSpan: 3,
          colStart: 0,
          rowStart: 0,
        },
        {
          id: 'ig-2',
          type: 'chart',
          chartType: 'rose-chart',
          title: 'Content Type Performance',
          colSpan: 3,
          rowSpan: 3,
          colStart: 6,
          rowStart: 0,
        },
        {
          id: 'ig-3',
          type: 'chart',
          chartType: 'gauge-chart',
          title: 'Audience Gender Split',
          colSpan: 3,
          rowSpan: 3,
          colStart: 9,
          rowStart: 0,
        },
        {
          id: 'ig-4',
          type: 'chart',
          chartType: 'stacked-bar-chart',
          title: 'Follower Age & Gender',
          colSpan: 6,
          rowSpan: 3,
          colStart: 0,
          rowStart: 3,
        },
        {
          id: 'ig-5',
          type: 'chart',
          chartType: 'donut-chart',
          title: 'Sentiment Analysis',
          colSpan: 6,
          rowSpan: 3,
          colStart: 6,
          rowStart: 3,
        },
      ],
    },

    // ── FACEBOOK PAGE ANALYTICS ───────────────────────────────────────────────
    {
      id: 'facebook',
      name: 'Facebook Page Analytics',
      description: 'Page reach, engagement, audience demographics and sentiment trends',
      iconId: 'facebook',
      category: 'Social',
      preview: 'facebook',
      iconGradient: 'linear-gradient(135deg, #1877f2 0%, #0c63d4 100%)',
      widgets: [
        {
          id: 'fb-1',
          type: 'chart',
          chartType: 'dual-line-chart',
          title: 'Reach vs Engagement',
          colSpan: 8,
          rowSpan: 3,
          colStart: 0,
          rowStart: 0,
        },
        {
          id: 'fb-2',
          type: 'chart',
          chartType: 'pie-chart',
          title: 'Audience by Social Class',
          colSpan: 4,
          rowSpan: 3,
          colStart: 8,
          rowStart: 0,
        },
        {
          id: 'fb-3',
          type: 'chart',
          chartType: 'horizontal-bar-chart',
          title: 'Top Posts by Engagement',
          colSpan: 4,
          rowSpan: 3,
          colStart: 0,
          rowStart: 3,
        },
        {
          id: 'fb-4',
          type: 'chart',
          chartType: 'stacked-bar-chart',
          title: 'Audience Demographics',
          colSpan: 4,
          rowSpan: 3,
          colStart: 4,
          rowStart: 3,
        },
        {
          id: 'fb-5',
          type: 'chart',
          chartType: 'donut-chart',
          title: 'Sentiment Breakdown',
          colSpan: 4,
          rowSpan: 3,
          colStart: 8,
          rowStart: 3,
        },
      ],
    },

    // ── EXECUTIVE SUMMARY ─────────────────────────────────────────────────────
    {
      id: 'executive',
      name: 'Executive Summary',
      description: 'High-level KPI overview with trends and strategic insights across all channels',
      iconId: 'bar-chart',
      category: 'Business',
      preview: 'executive',
      iconGradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
      widgets: [
        {
          id: 'ex-s1',
          type: 'summary',
          title: 'Executive Summary',
          content:
            'Q4 performance shows 23% growth in digital engagement. Social media reach increased by 45K users, with Instagram leading at 18K new followers. YouTube watch time up 2.1K hours. Overall engagement rate improved to 4.8%, exceeding the quarterly target of 4.2%.',
          colSpan: 12,
          rowSpan: 2,
          colStart: 0,
          rowStart: 0,
        },
        {
          id: 'ex-1',
          type: 'chart',
          chartType: 'dual-line-chart',
          title: 'Reach vs Impressions',
          colSpan: 6,
          rowSpan: 3,
          colStart: 0,
          rowStart: 2,
        },
        {
          id: 'ex-2',
          type: 'chart',
          chartType: 'grouped-bar-chart',
          title: 'Platform Sentiment Comparison',
          colSpan: 6,
          rowSpan: 3,
          colStart: 6,
          rowStart: 2,
        },
        {
          id: 'ex-3',
          type: 'chart',
          chartType: 'horizontal-bar-chart',
          title: 'Top Content by Performance',
          colSpan: 4,
          rowSpan: 3,
          colStart: 0,
          rowStart: 5,
        },
        {
          id: 'ex-4',
          type: 'chart',
          chartType: 'line-chart',
          title: 'Monthly Engagement Trend',
          colSpan: 4,
          rowSpan: 3,
          colStart: 4,
          rowStart: 5,
        },
        {
          id: 'ex-5',
          type: 'chart',
          chartType: 'donut-chart',
          title: 'Overall Sentiment',
          colSpan: 4,
          rowSpan: 3,
          colStart: 8,
          rowStart: 5,
        },
      ],
    },

    // ── TWITTER (X) ANALYTICS ─────────────────────────────────────────────────
    {
      id: 'twitter',
      name: 'Twitter (X) Analytics',
      description: 'Impressions, mentions, engagement trends and audience sentiment on X',
      iconId: 'twitter',
      category: 'Social',
      preview: 'twitter',
      iconGradient: 'linear-gradient(135deg, #1d9bf0 0%, #0f6eb4 100%)',
      widgets: [
        {
          id: 'tw-1',
          type: 'chart',
          chartType: 'line-chart',
          title: 'Impressions Over Time',
          colSpan: 6,
          rowSpan: 3,
          colStart: 0,
          rowStart: 0,
        },
        {
          id: 'tw-2',
          type: 'chart',
          chartType: 'bar-chart',
          title: 'Top Tweets by Engagement',
          colSpan: 6,
          rowSpan: 3,
          colStart: 6,
          rowStart: 0,
        },
        {
          id: 'tw-3',
          type: 'chart',
          chartType: 'donut-chart',
          title: 'Sentiment Distribution',
          colSpan: 4,
          rowSpan: 3,
          colStart: 0,
          rowStart: 3,
        },
        {
          id: 'tw-4',
          type: 'chart',
          chartType: 'ranked-bar-chart',
          title: 'Top Engagement Triggers',
          colSpan: 4,
          rowSpan: 3,
          colStart: 4,
          rowStart: 3,
        },
        {
          id: 'tw-5',
          type: 'chart',
          chartType: 'multi-line-chart',
          title: 'Follower Growth',
          colSpan: 4,
          rowSpan: 3,
          colStart: 8,
          rowStart: 3,
        },
      ],
    },

    // ── TIKTOK ANALYTICS ──────────────────────────────────────────────────────
    {
      id: 'tiktok',
      name: 'TikTok Analytics',
      description: 'Viral content analysis, view trends, audience growth and engagement',
      iconId: 'smartphone',
      category: 'Content',
      preview: 'tiktok',
      iconGradient: 'linear-gradient(135deg, #010101 0%, #69c9d0 50%, #ee1d52 100%)',
      widgets: [
        {
          id: 'tt-1',
          type: 'chart',
          chartType: 'multi-line-chart',
          title: 'Video Views Growth',
          colSpan: 8,
          rowSpan: 3,
          colStart: 0,
          rowStart: 0,
        },
        {
          id: 'tt-2',
          type: 'chart',
          chartType: 'rose-chart',
          title: 'Emotion Reactions',
          colSpan: 4,
          rowSpan: 3,
          colStart: 8,
          rowStart: 0,
        },
        {
          id: 'tt-3',
          type: 'chart',
          chartType: 'ranked-bar-chart',
          title: 'Viral Triggers',
          colSpan: 4,
          rowSpan: 3,
          colStart: 0,
          rowStart: 3,
        },
        {
          id: 'tt-4',
          type: 'chart',
          chartType: 'stacked-bar-chart',
          title: 'Audience Age & Gender',
          colSpan: 4,
          rowSpan: 3,
          colStart: 4,
          rowStart: 3,
        },
        {
          id: 'tt-5',
          type: 'chart',
          chartType: 'donut-chart',
          title: 'Sentiment Analysis',
          colSpan: 4,
          rowSpan: 3,
          colStart: 8,
          rowStart: 3,
        },
      ],
    },
  ];

  setTemplateWidgets(dashboardId: string, widgets: any[]): void {
    this.templateDataSubject.next({ dashboardId, widgets });
  }

  clearTemplateWidgets(): void {
    this.templateDataSubject.next(null);
  }

  getTemplates(): DashboardTemplate[] {
    return this.templates;
  }

  getTemplateById(id: string): DashboardTemplate | undefined {
    return this.templates.find((t) => t.id === id);
  }
}
