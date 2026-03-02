/**
 * ai-chart-modal.component.ts
 *
 * BASE = document 15 (original) — every property, method and interface kept identical.
 *
 * Additions (minimal):
 *   • NgxEchartsDirective added to imports so HTML can use [echarts]
 *   • Each ChartTemplate gains optional `lucideIcon`, `categoryColor`, `gridChartType`
 *   • `previewOptions` map built once (keyed by template.id)
 *   • `chatPreviewOption` set when AI generates a response
 *   • `generate` output changed from EventEmitter<string> → EventEmitter<any>
 *     so it can emit either a plain string (old containers) or a Partial<GridItem>
 */
import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import {
  LucideAngularModule,
  TrendingUp,
  BarChart2,
  PieChart,
  LineChart,
  Activity,
  Users,
  Globe,
  Smile,
  Zap,
  Trophy,
  Smartphone,
  LayoutGrid,
  Lightbulb,
  MapPin,
  Battery,
  UserCheck,
  Award,
  BarChart,
  Hash,
} from 'lucide-angular';

import { ThemeService } from '../../../../core/services/theme.service';
import { GridItem } from '../../../../core/models/grid-item.model';
import {
  previewLineChart,
  previewBarChart,
  previewDonutChart,
  previewPieChart,
  previewRoseChart,
  previewGaugeChart,
  previewGenderChart,
  previewStackedBarChart,
  previewGroupedBarChart,
  previewMultiLineChart,
  previewDualLineChart,
  previewBarVerticalChart,
  getChartOption,
  PALETTE,
  DashboardChartType,
} from '../../../../core/data/chart-config';

// Per-category accent colours
const CAT_COLOR: Record<string, string> = {
  All: '#6366f1',
  Engagement: '#10b981',
  Growth: '#06b6d4',
  Content: '#f59e0b',
  Audience: '#ec4899',
  Performance: '#3b82f6',
};

export interface ChartTemplate {
  id: string;
  title: string;
  description: string;
  chartType: string;
  icon: string; // kept for TS compat; not used in template (Lucide used instead)
  preview: string; // key into previewOptions
  gridChartType?: DashboardChartType;
  gridItemType?: 'chart' | 'count-card'; // overrides emitted type; defaults to 'chart'
  lucideIcon?: any;
  categoryColor?: string;
  category: string;
  examplePrompts: string[];
}

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  preview?: { type: string; title: string; prompt: string };
}

@Component({
  selector: 'app-ai-chart-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEchartsDirective, LucideAngularModule],
  templateUrl: './ai-chart-modal.component.html',
  styleUrls: ['./ai-chart-modal.component.css'],
})
export class AiChartModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() generate = new EventEmitter<any>();

  // ECharts init options
  readonly svgOpts = { renderer: 'svg' as const };
  readonly canvasOpts = { renderer: 'canvas' as const };
  private readonly themeService = inject(ThemeService);

  // ── Original state — unchanged ───────────────────────────────────────────
  searchQuery = '';
  selectedCategory = 'All';
  selectedTemplate: ChartTemplate | null = null;
  showChat = false;
  chatMessages: AiChatMessage[] = [];
  userMessage = '';
  isGenerating = false;
  currentPreview: any = null;

  // New: ECharts options
  previewOptions: Record<string, EChartsOption> = {};
  chatPreviewOption: EChartsOption = {};

  // ── Original categories — unchanged ──────────────────────────────────────
  categories = ['All', 'Engagement', 'Growth', 'Content', 'Audience', 'Performance'];

  // ── Templates — original list + lucideIcon / categoryColor / gridChartType ─
  templates: ChartTemplate[] = [
    {
      id: 'custom',
      title: 'Custom Chart',
      description: 'Describe your chart and AI will create it for you',
      chartType: 'AI Direct',
      icon: '💡',
      preview: 'line',
      gridChartType: 'line-chart',
      lucideIcon: Lightbulb,
      categoryColor: '#7c3aed',
      category: 'All',
      examplePrompts: [
        'Show me engagement trends over the last 30 days',
        'Compare follower growth across all platforms',
        'Display top 10 posts by likes this month',
      ],
    },
    {
      id: 'engagement-trend',
      title: 'Engagement Rate Trend',
      description: 'Track engagement over time',
      chartType: 'Line Chart',
      icon: '📈',
      preview: 'line',
      gridChartType: 'line-chart',
      lucideIcon: TrendingUp,
      categoryColor: CAT_COLOR['Engagement'],
      category: 'Engagement',
      examplePrompts: [
        'Show engagement for the last 7 days',
        'Compare engagement between platforms',
        'Show hourly engagement patterns',
      ],
    },
    {
      id: 'post-performance',
      title: 'Post Performance',
      description: 'Compare different post types',
      chartType: 'Bar Chart',
      icon: '📊',
      preview: 'bar',
      gridChartType: 'horizontal-bar-chart',
      lucideIcon: BarChart2,
      categoryColor: CAT_COLOR['Content'],
      category: 'Content',
      examplePrompts: [
        'Show top 5 posts by engagement',
        'Compare videos vs images performance',
        'Show post performance by day of week',
      ],
    },
    {
      id: 'platform-split',
      title: 'Platform Distribution',
      description: 'Followers across platforms',
      chartType: 'Pie Chart',
      icon: '🥧',
      preview: 'pie',
      gridChartType: 'pie-chart',
      lucideIcon: PieChart,
      categoryColor: CAT_COLOR['Audience'],
      category: 'Audience',
      examplePrompts: [
        'Show follower distribution',
        'Compare audience size by platform',
        'Display engagement share per platform',
      ],
    },
    {
      id: 'growth',
      title: 'Follower Growth',
      description: 'Track growth over time',
      chartType: 'Area Chart',
      icon: '📈',
      preview: 'area',
      gridChartType: 'multi-line-chart',
      lucideIcon: LineChart,
      categoryColor: CAT_COLOR['Growth'],
      category: 'Growth',
      examplePrompts: [
        'Show growth for last 90 days',
        'Compare growth rate by platform',
        'Highlight growth milestones',
      ],
    },
    {
      id: 'top-content',
      title: 'Top Content',
      description: 'Best performing posts',
      chartType: 'Bar Chart',
      icon: '🏆',
      preview: 'hbar',
      gridChartType: 'ranked-bar-chart',
      lucideIcon: Trophy,
      categoryColor: CAT_COLOR['Performance'],
      category: 'Performance',
      examplePrompts: [
        'Top 10 posts this month',
        'Best performing content types',
        'Highest engagement posts',
      ],
    },
    {
      id: 'story-metrics',
      title: 'Story Performance',
      description: 'Instagram & Facebook stories',
      chartType: 'Line Chart',
      icon: '📱',
      preview: 'line',
      gridChartType: 'line-chart',
      lucideIcon: Smartphone,
      categoryColor: CAT_COLOR['Content'],
      category: 'Content',
      examplePrompts: [
        'Story views over 2 weeks',
        'Story completion rates',
        'Compare story vs post engagement',
      ],
    },
    {
      id: 'demographics',
      title: 'Audience Demographics',
      description: 'Age and gender breakdown',
      chartType: 'Stacked Bar',
      icon: '👥',
      preview: 'stacked',
      gridChartType: 'stacked-bar-chart',
      lucideIcon: Users,
      categoryColor: CAT_COLOR['Audience'],
      category: 'Audience',
      examplePrompts: [
        'Show age distribution',
        'Compare demographics by platform',
        'Display gender breakdown',
      ],
    },
    {
      id: 'reach-impressions',
      title: 'Reach vs Impressions',
      description: 'Compare reach and impressions',
      chartType: 'Dual Line',
      icon: '🌐',
      preview: 'dualline',
      gridChartType: 'dual-line-chart',
      lucideIcon: Globe,
      categoryColor: CAT_COLOR['Performance'],
      category: 'Performance',
      examplePrompts: [
        'Compare reach and impressions',
        'Show frequency trends',
        'Analyze reach expansion',
      ],
    },
    {
      id: 'sentiment',
      title: 'Sentiment Analysis',
      description: 'Viewer sentiment breakdown',
      chartType: 'Donut Chart',
      icon: '💬',
      preview: 'donut',
      gridChartType: 'donut-chart',
      lucideIcon: Zap,
      categoryColor: CAT_COLOR['Audience'],
      category: 'Audience',
      examplePrompts: [
        'Show positive vs negative sentiment',
        'Sentiment breakdown by topic',
        'Weekly sentiment trend',
      ],
    },
    {
      id: 'emotions',
      title: 'Emotion Breakdown',
      description: 'Viewer emotional response map',
      chartType: 'Rose Chart',
      icon: '😊',
      preview: 'rose',
      gridChartType: 'rose-chart',
      lucideIcon: Smile,
      categoryColor: CAT_COLOR['Audience'],
      category: 'Audience',
      examplePrompts: ['Show emotional breakdown', 'Fear vs joy analysis', 'Viewer reaction map'],
    },
    {
      id: 'political',
      title: 'Political Sentiment',
      description: 'Candidate sentiment tracker',
      chartType: 'Grouped Bar',
      icon: '🗳️',
      preview: 'grouped',
      gridChartType: 'grouped-bar-chart',
      lucideIcon: Activity,
      categoryColor: CAT_COLOR['Performance'],
      category: 'Performance',
      examplePrompts: [
        'Candidate approval ratings',
        'Positive vs negative per candidate',
        'Election sentiment over time',
      ],
    },
    {
      id: 'gender-split',
      title: 'Gender Split',
      description: 'Semicircle chart with ♂/♀ icons and gradient arc',
      chartType: 'Gender Chart',
      icon: '⚧',
      preview: 'gender',
      gridChartType: 'gauge-chart',
      lucideIcon: UserCheck,
      categoryColor: CAT_COLOR['Audience'],
      category: 'Audience',
      examplePrompts: [
        'Male vs female split',
        'Gender audience breakdown',
        'Compare gender engagement',
      ],
    },
    {
      id: 'election-poll',
      title: 'Election Poll',
      description: 'Multi-candidate vertical bar chart with percentage labels',
      chartType: 'Bar Chart',
      icon: '🗳️',
      preview: 'barvert',
      gridChartType: 'bar-chart',
      lucideIcon: BarChart,
      categoryColor: CAT_COLOR['Performance'],
      category: 'Comparison',
      examplePrompts: [
        'Election poll aggregator',
        'Candidate vote share',
        'Poll vs actual turnout',
      ],
    },
    {
      id: 'regional-sentiment',
      title: 'Regional Sentiment',
      description: 'Color-coded horizontal bars by region',
      chartType: 'Horizontal Bar',
      icon: '🗺️',
      preview: 'hbar',
      gridChartType: 'map-chart',
      lucideIcon: MapPin,
      categoryColor: CAT_COLOR['Engagement'],
      category: 'Comparison',
      examplePrompts: [
        'Sentiment by region',
        'Geographic audience breakdown',
        'Regional performance comparison',
      ],
    },
    {
      id: 'stat-card',
      title: 'Stat Card',
      description:
        'A single metric with title, big number, optional platform logo, and optional trend indicator (↑/↓)',
      chartType: 'Stat Card',
      icon: '#',
      preview: 'stat-card', // special key — renders the custom HTML preview, not echarts
      gridItemType: 'count-card', // emits type:'count-card', not type:'chart'
      lucideIcon: Hash,
      categoryColor: '#06b6d4',
      category: 'Performance',
      examplePrompts: [
        'Facebook total conversations this week',
        'Instagram reach with change indicator',
        'All posts count with logo',
      ],
    },
  ];

  ngOnInit(): void {
    this.buildPreviews();
  }

  private buildPreviews(): void {
    this.previewOptions = {
      line: previewLineChart(''),
      area: previewLineChart(''),
      multiline: previewMultiLineChart(), // area chart - follower growth
      dualline: previewDualLineChart(), // 2 lines - reach vs impressions
      bar: previewBarChart('', false),
      hbar: previewBarChart('', true),
      barvert: previewBarVerticalChart(), // vertical bars - election poll
      stacked: previewStackedBarChart(),
      grouped: previewGroupedBarChart(),
      pie: previewPieChart([]),
      donut: previewDonutChart([]),
      rose: previewRoseChart([]),
      gauge: previewGaugeChart(''),
      gender: previewGenderChart(),
    };
  }

  // ── All original methods — unchanged ──────────────────────────────────────
  onClose(): void {
    this.close.emit();
  }

  selectTemplate(template: ChartTemplate): void {
    this.selectedTemplate = template;
    this.showChat = true;
    this.chatMessages = [];
    this.currentPreview = null;
    this.chatPreviewOption = {};

    this.chatMessages.push({
      role: 'assistant',
      content:
        template.id === 'custom'
          ? "Hi! I'm here to help you create a custom chart. Describe what you'd like to visualize and I'll create it for you."
          : `Great choice! I'll help you create a ${template.chartType} for ${template.title}. You can use one of the example prompts or describe your own customization.`,
      timestamp: new Date(),
    });
  }

  backToTemplates(): void {
    this.showChat = false;
    this.selectedTemplate = null;
    this.chatMessages = [];
    this.userMessage = '';
    this.currentPreview = null;
    this.chatPreviewOption = {};
  }

  useExamplePrompt(prompt: string): void {
    this.userMessage = prompt;
    this.sendMessage();
  }

  handleEnterKey(event: Event): void {
    const e = event as KeyboardEvent;
    if (!e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(): void {
    if (!this.userMessage.trim() || this.isGenerating) return;

    const userPrompt = this.userMessage;
    this.chatMessages.push({ role: 'user', content: userPrompt, timestamp: new Date() });
    this.userMessage = '';
    this.isGenerating = true;

    setTimeout(() => {
      const preview = {
        type: this.selectedTemplate?.preview || 'line',
        title: this.selectedTemplate?.title || 'Custom Chart',
        prompt: userPrompt,
      };

      // Build ECharts option for chat preview (stat-card uses custom HTML, not echarts)
      const isDark =
        this.themeService.isDark || document.documentElement.getAttribute('data-theme') === 'dark';
      if (this.selectedTemplate?.gridItemType === 'count-card') {
        this.chatPreviewOption = {};
      } else if (this.selectedTemplate?.gridChartType) {
        const opt = getChartOption(this.selectedTemplate.gridChartType, isDark);
        this.chatPreviewOption = { ...opt, tooltip: { show: false } };
      } else {
        this.chatPreviewOption = this.previewOptions[preview.type] ?? this.previewOptions['line'];
      }

      this.chatMessages.push({
        role: 'assistant',
        content:
          "I've generated a preview based on your request. You can add it to your dashboard or request adjustments.",
        timestamp: new Date(),
        preview,
      });

      this.isGenerating = false;
    }, 2000);
  }

  addToDashboard(): void {
    const first = this.chatMessages.find((m) => m.role === 'user');
    if (!first) return;
    const tpl = this.selectedTemplate;
    if (tpl?.gridItemType === 'count-card') {
      this.generate.emit({
        type: 'count-card',
        title: tpl.title,
        cardValue: 0,
        cardSubtitle: tpl.title,
      } as Partial<GridItem>);
    } else if (tpl?.gridChartType) {
      this.generate.emit({
        type: 'chart',
        title: tpl.title,
        chartType: tpl.gridChartType,
      } as Partial<GridItem>);
    } else {
      this.generate.emit(first.content);
    }
    this.onClose();
  }

  addPreviewToDashboard(preview: any): void {
    const tpl = this.templates.find((t) => t.preview === preview.type || t.id === preview.type);
    if (tpl?.gridItemType === 'count-card') {
      this.generate.emit({
        type: 'count-card',
        title: preview.title,
        cardValue: 0,
        cardSubtitle: preview.title,
      } as Partial<GridItem>);
    } else if (tpl?.gridChartType) {
      this.generate.emit({
        type: 'chart',
        title: preview.title,
        chartType: tpl.gridChartType,
      } as Partial<GridItem>);
    } else {
      this.generate.emit(preview.prompt);
    }
    this.onClose();
  }

  getFilteredTemplates(): ChartTemplate[] {
    let filtered = this.templates;
    if (this.selectedCategory !== 'All') {
      filtered = filtered.filter(
        (t) => t.category === this.selectedCategory || t.category === 'All',
      );
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
      );
    }
    return filtered;
  }

  // kept for any legacy callers
  getPreviewSVG(type: string): string {
    const m: Record<string, string> = {
      line: 'M3 17l6-6 4 4 8-8M3 21h18',
      area: 'M7 12l3-9 3 9 3-4 3 4',
      bar: 'M3 17v4m6-8v8m6-12v12m6-8v8',
      pie: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z',
      donut: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z',
      rose: 'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z',
      hbar: 'M4 6h16M4 12h10M4 18h14',
    };
    return m[type] ?? m['bar'];
  }
}
