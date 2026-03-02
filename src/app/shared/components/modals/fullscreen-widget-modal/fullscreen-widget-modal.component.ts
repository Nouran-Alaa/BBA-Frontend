import { Component, Input, Output, EventEmitter, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

import { GridItem } from '../../../../core/models/grid-item.model';
import {
  getChartOption,
  countKpiChart,
  DashboardChartType,
  PALETTE,
} from '../../../../core/data/chart-config';
import { ThemeService } from '../../../../core/services/theme.service';

type WidgetTab = 'chart' | 'story';

interface StorySection {
  icon: string;
  heading: string;
  body: string;
}

@Component({
  selector: 'app-fullscreen-widget-modal',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  templateUrl: './fullscreen-widget-modal.component.html',
  styleUrls: ['./fullscreen-widget-modal.component.css'],
})
export class FullscreenWidgetModalComponent implements OnInit {
  @Input() widget!: GridItem;
  @Output() close = new EventEmitter<void>();

  chartOption: EChartsOption = {};
  readonly initOpts = { renderer: 'canvas' as const };

  activeTab: WidgetTab = 'chart';
  storySections: StorySection[] = [];

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    const dark = this.themeService.isDark;

    if (this.widget?.type === 'chart' && this.widget?.chartType) {
      this.chartOption = getChartOption(this.widget.chartType as DashboardChartType, dark);
    }
    if (this.widget?.type === 'count') {
      this.chartOption = countKpiChart({
        value: this.widget.value ?? 0,
        label: this.widget.label ?? this.widget.title ?? '',
        max: this.widget.countMax,
        color: this.widget.countColor ?? PALETTE.primary,
        dark,
      });
    }

    this.storySections = this.buildStorySections();
  }

  onClose(): void {
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.onClose();
  }

  // ── Calculation helpers ───────────────────────────────────────────────────
  get calcResult(): number {
    const vals: number[] = this.widget?.calcValues ?? [];
    if (!vals.length) return 0;
    switch (this.widget?.calcFormula) {
      case 'sum':
        return vals.reduce((a: number, b: number) => a + b, 0);
      case 'average':
        return Math.round(vals.reduce((a: number, b: number) => a + b, 0) / vals.length);
      case 'max':
        return Math.max(...vals);
      case 'min':
        return Math.min(...vals);
      case 'count':
        return vals.length;
      default:
        return vals.reduce((a: number, b: number) => a + b, 0);
    }
  }

  get calcLabel(): string {
    const map: Record<string, string> = {
      sum: 'Total',
      average: 'Average',
      max: 'Maximum',
      min: 'Minimum',
      count: 'Count',
    };
    return map[this.widget?.calcFormula ?? 'sum'] ?? 'Total';
  }

  // ── Story builder ─────────────────────────────────────────────────────────
  private buildStorySections(): StorySection[] {
    const t = this.widget?.title ?? 'This chart';
    const ct = (this.widget?.chartType ?? '') as DashboardChartType;

    const iconChart =
      'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z';
    const iconTrend = 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6';
    const iconPeople =
      'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z';
    const iconGlobe =
      'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    const iconHeart =
      'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z';
    const iconInsight =
      'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z';

    const lookup: Partial<Record<DashboardChartType, StorySection[]>> = {
      'line-chart': [
        {
          icon: iconTrend,
          heading: 'The Trend Story',
          body: `"${t}" traces a single performance metric across time. Each data point represents a moment in your audience's journey — peaks signal viral moments or campaign spikes, while troughs reveal when engagement dropped off. Reading the slope tells you velocity: a steep rise means rapid growth; a plateau means stability or saturation.`,
        },
        {
          icon: iconInsight,
          heading: 'What to Watch',
          body: `Look for inflection points — places where the line suddenly changes direction. These mark real-world events: a post going viral, an algorithm change, or seasonal behaviour. Comparing the slope across different time windows reveals whether your growth is accelerating or decelerating.`,
        },
        {
          icon: iconChart,
          heading: 'Taking Action',
          body: `If the trend is rising, double down on what caused the uptick. If it's falling, trace back to when the decline started and correlate it with your publishing or campaign calendar. A flat line after a spike usually means you captured a new audience that hasn't been re-engaged yet.`,
        },
      ],
      'dual-line-chart': [
        {
          icon: iconTrend,
          heading: 'Two Metrics, One Story',
          body: `"${t}" shows Reach and Impressions side by side. Reach counts unique people who saw your content; Impressions count every view including repeats. When Impressions far outpace Reach, your existing audience is seeing your content multiple times — a sign of sticky, re-consumed content.`,
        },
        {
          icon: iconInsight,
          heading: 'The Gap Reveals Intent',
          body: `The distance between the two lines is your re-engagement signal. A widening gap means your content is compelling enough for repeat views. A narrowing gap means you're reaching fresh eyes but not holding attention for return visits. Both patterns have strategic implications depending on your goals.`,
        },
        {
          icon: iconChart,
          heading: 'Optimising the Ratio',
          body: `For awareness campaigns, maximise Reach. For depth and brand recall, a high Impressions-to-Reach ratio is desirable. If both lines decline together, your distribution needs attention. If Reach grows while Impressions stagnate, your content isn't compelling enough for second views.`,
        },
      ],
      'multi-line-chart': [
        {
          icon: iconTrend,
          heading: 'Growth Trajectory',
          body: `"${t}" maps your follower or subscriber base as a smooth area, showing cumulative growth momentum. Unlike engagement metrics that fluctuate daily, follower count is a lagging indicator — it confirms whether your overall strategy is working over weeks and months, not days.`,
        },
        {
          icon: iconInsight,
          heading: 'Reading the Curve Shape',
          body: `An S-curve (slow start, rapid middle, plateau) is the most common pattern. The steep middle often aligns with a breakout piece or collaboration. A straight upward line means consistent growth. A flat section followed by a spike signals an external event drove a surge — worth investigating.`,
        },
        {
          icon: iconChart,
          heading: 'Sustaining Momentum',
          body: `Follower growth compounds like interest — each new follower potentially brings their network. Identify the content published during your steepest growth periods. Consistency matters more than volume: regular publishing maintains the curve, while erratic posting flattens it.`,
        },
      ],
      'bar-chart': [
        {
          icon: iconChart,
          heading: 'Ranking by Performance',
          body: `"${t}" ranks discrete items by a single performance metric. The tallest bar is your benchmark — everything else should be measured relative to it. The visual hierarchy makes outliers immediately obvious and directs your attention to what's working best.`,
        },
        {
          icon: iconInsight,
          heading: 'The Long Tail',
          body: `Pay attention to the shorter bars. A steep drop-off after the top 2–3 bars means performance is concentrated in a few pieces. A more even distribution suggests consistent quality. Understanding why your top bars performed so well is more valuable than celebrating the result.`,
        },
        {
          icon: iconChart,
          heading: 'Replicating Winners',
          body: `Audit the metadata of your highest-performing items: publish time, topic, format, length, headline style. Build a hypothesis and test it. Bar charts answer "what" — your job is to answer "why."`,
        },
      ],
      'stacked-bar-chart': [
        {
          icon: iconPeople,
          heading: 'Audience Composition',
          body: `"${t}" breaks your audience down by age bracket with each bar split between male and female segments. Total bar height shows which age group is largest; the split inside shows gender balance within each group. Together, they paint a full demographic portrait.`,
        },
        {
          icon: iconInsight,
          heading: 'Targeting Implications',
          body: `If one age group dominates, ask whether that's intentional or a blind spot. A platform skewing 18–24 suggests short-form trend-driven content resonates. Skewing 35–44 suggests professional or lifestyle content. Mismatches between your target and actual audience reveal where messaging may need adjustment.`,
        },
        {
          icon: iconChart,
          heading: 'Platform Strategy',
          body: `Cross-reference this chart with platform analytics. Different platforms have different demographic baselines — an imbalance on one platform may be normal for that channel. Use this data to decide where to concentrate ad spend and which content formats to prioritise.`,
        },
      ],
      'grouped-bar-chart': [
        {
          icon: iconChart,
          heading: 'Side-by-Side Sentiment',
          body: `"${t}" places positive and negative sentiment bars next to each other for each subject. This direct comparison reveals public perception at a glance. A tall green bar beside a short red bar signals strong net-positive sentiment; near-equal bars signal a polarised audience.`,
        },
        {
          icon: iconInsight,
          heading: 'The Neutral Silent Majority',
          body: `The bars you see represent expressed sentiment. The audience not captured here — those who engaged without a strong emotional response — is often larger. When both bars are relatively small, it may indicate low salience rather than balance.`,
        },
        {
          icon: iconTrend,
          heading: 'Narrative Momentum',
          body: `Sentiment shifts are often more important than point-in-time snapshots. A growing negative bar despite stable positives is an early warning signal. Conversely, a rising positive bar during a campaign confirms messaging resonance before the campaign concludes.`,
        },
      ],
      'donut-chart': [
        {
          icon: iconHeart,
          heading: 'Sentiment at a Glance',
          body: `"${t}" divides your audience's emotional response into segments. The arc proportions give an instant read on overall sentiment health. A dominant positive arc is the goal for most brands; a large neutral segment often means there's an opportunity to convert passive observers into advocates.`,
        },
        {
          icon: iconInsight,
          heading: 'The Neutral Opportunity',
          body: `Neutral sentiment is not indifference — it's undecided. People who engaged without strong feeling represent your most convertible audience segment. They've noticed you; they just haven't been moved yet. High-quality targeted content shifts neutrals toward positive more efficiently than recovering from negative.`,
        },
        {
          icon: iconChart,
          heading: 'Negative Sentiment Management',
          body: `A growing negative slice is an early warning system. It rarely appears suddenly — it builds gradually from unresolved complaints or misaligned messaging. Cross-referencing negative sentiment spikes with your content calendar reveals which posts are causing friction.`,
        },
      ],
      'rose-chart': [
        {
          icon: iconHeart,
          heading: 'The Emotion Spectrum',
          body: `"${t}" maps the emotional fingerprint of your content as a nightingale rose. Petal size indicates the relative strength of each emotion. Unlike simple sentiment, this chart captures the nuance of how people actually feel — not just whether they feel good or bad.`,
        },
        {
          icon: iconInsight,
          heading: 'Emotional Resonance',
          body: `High joy and surprise petals correlate with viral potential — content that makes people feel unexpectedly delighted spreads. High anger or fear can also drive shares, but at a reputational cost. A wide spread across emotions suggests polarising content; a concentrated rose suggests consistent emotional branding.`,
        },
        {
          icon: iconChart,
          heading: 'Crafting with Intent',
          body: `Use this chart to set emotional goals for your content strategy. If you want inspirational content, optimise for joy and hope. If the dominant emotion is one you didn't intend, review your framing, headlines, and imagery — they're sending a different signal than planned.`,
        },
      ],
      'gauge-chart': [
        {
          icon: iconPeople,
          heading: 'Gender Balance',
          body: `"${t}" shows the male-to-female split in your audience. Each arc represents one gender's proportion of total audience. The difference between them reveals whether your content or platform is attracting one demographic more strongly than planned.`,
        },
        {
          icon: iconInsight,
          heading: 'Context Matters',
          body: `A gender imbalance is only a problem if it misaligns with your target. A beauty brand skewing female is expected; a gaming channel skewing male may be intentional. The insight is whether your actual split aligns with your intended audience, and whether it's shifting over time.`,
        },
        {
          icon: iconChart,
          heading: 'Closing the Gap',
          body: `If you want a more balanced audience, research what content over-indexes with the underrepresented gender on your platform. Small adjustments to thumbnails, language, and topic selection can meaningfully shift the balance over 8–12 weeks.`,
        },
      ],
      'pie-chart': [
        {
          icon: iconPeople,
          heading: 'Audience Segments',
          body: `"${t}" divides your audience by a categorical dimension. The largest slice dominates your current reach; smaller slices represent niche audiences or underserved opportunities depending on your strategy.`,
        },
        {
          icon: iconInsight,
          heading: 'The 80/20 of Attention',
          body: `In most audience distributions, 2–3 segments account for the majority of engagement. These are your core audience. The long tail of smaller segments often shows higher per-person engagement and more willingness to share content tailored specifically to them.`,
        },
        {
          icon: iconChart,
          heading: 'Segmented Strategy',
          body: `Avoid treating all segments identically. Each slice has distinct motivations, values, and content preferences. Creating content for your top 2 segments while maintaining accessibility for others is more effective than generic content aimed at everyone.`,
        },
      ],
      'horizontal-bar-chart': [
        {
          icon: iconChart,
          heading: 'What Drives Behaviour',
          body: `"${t}" ranks the triggers or motivators that drive your audience to watch, engage, or purchase. The longest bar is your primary driver — the main reason people show up. Subsequent bars reveal secondary motivations that reinforce the primary one.`,
        },
        {
          icon: iconInsight,
          heading: 'Prioritising Your Messaging',
          body: `Your content, headlines, and calls-to-action should mirror this ranking. If curiosity is the top trigger, lead with unanswered questions. If social proof drives the most action, showcase community and engagement counts. Misaligning your messaging with actual triggers is one of the most common reasons content underperforms.`,
        },
        {
          icon: iconTrend,
          heading: 'Triggers Evolve',
          body: `Audience motivations shift with time, culture, and platform changes. A trigger that was dominant six months ago may have weakened as your audience matured. Re-examine this chart quarterly and adjust your content brief accordingly.`,
        },
      ],
      'ranked-bar-chart': [
        {
          icon: iconChart,
          heading: 'Top Performers Ranked',
          body: `"${t}" shows your content ranked from highest to lowest impact. The visual slope of the bars tells you how concentrated or distributed performance is — a sharp drop after position 1 means one outlier drives everything; a gradual slope means consistent quality across the board.`,
        },
        {
          icon: iconInsight,
          heading: 'The Compounding Effect',
          body: `Top-ranked items benefit from a flywheel: high performance → more algorithmic distribution → more engagement → higher ranking. Understanding what got your top item there first requires looking beyond the data to the story: was it timing, a headline, a collaboration, or a topic trend?`,
        },
        {
          icon: iconChart,
          heading: 'The Underdogs',
          body: `Low-ranked items aren't failures — they're experiments. Some were deliberately low-investment tests. Others might have high quality but wrong timing or poor distribution. Re-examine items ranked just outside your top tier: a small promotional push might move them significantly.`,
        },
      ],
      'map-chart': [
        {
          icon: iconGlobe,
          heading: 'Where Your Audience Lives',
          body: `"${t}" maps the geographic distribution of your audience's sentiment or engagement. Darker regions represent stronger signal. Lighter regions represent untapped or underperforming geographic markets worth investigating for localisation opportunities.`,
        },
        {
          icon: iconInsight,
          heading: 'Regional Sentiment Differences',
          body: `The same content can land very differently in different regions due to cultural context and local events. A piece that drives strong positive sentiment in urban centres might register neutral in rural areas — not because of quality but because of relevance.`,
        },
        {
          icon: iconChart,
          heading: 'Geographic Strategy',
          body: `Prioritise ad spend in regions showing high positive sentiment — they're already warm audiences that convert cheaply. Investigate neutral regions for localisation opportunities. Regions with high negative sentiment require reputation management before investment.`,
        },
      ],
    };

    return (
      lookup[ct] ?? [
        {
          icon: iconChart,
          heading: 'Understanding This Chart',
          body: `"${t}" visualises a key metric from your analytics. Look for patterns, outliers, and trends rather than focusing on absolute numbers. The shape of the data tells a story — look for where it changes direction, what the extremes are, and how different segments compare.`,
        },
        {
          icon: iconInsight,
          heading: 'Turning Data into Action',
          body: `Every chart metric is a lagging indicator — it tells you what already happened. The value is in identifying the cause behind the pattern so you can influence the next data point. Ask: what was different about the periods that performed best? What can you replicate?`,
        },
      ]
    );
  }
}
