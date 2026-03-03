/**
 * chart-config.ts — v6
 * Based on user's v5. Changes:
 *  1. ALL chart text colors fully dark-mode aware (axes, labels, legends)
 *  2. Richer animations: grow-in with stagger, separate update easing
 *  3. Donut charts: ZERO center text, clean ring + outside label lines
 *  4. emotion-donut → Nightingale Rose chart (roseType:'area')
 *  5. social-class → clean basic pie with legend (replaces old pie w/ graphic letters)
 *  6. countKpiChart() → ECharts arc-gauge KPI card for the count widget
 *  7. previewRoseChart() added for modal
 *  8. All buying-cycle / watching-triggers / social-class chart variants restored
 */

import type { EChartsOption, GaugeSeriesOption } from 'echarts';

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATIONS  — slow grow-in with per-item stagger, smooth update transition
// ─────────────────────────────────────────────────────────────────────────────
const ANIM = {
  animation: true as const,
  animationDuration: 1200,
  animationEasing: 'cubicOut' as const,
  animationDelay: (idx: number) => idx * 80, // stagger per bar/slice/point
  animationDurationUpdate: 700,
  animationEasingUpdate: 'cubicInOut' as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// PALETTE
// ─────────────────────────────────────────────────────────────────────────────
export const PALETTE = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#f59e0b',
  male: '#0ea5e9',
  female: '#ec4899',
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#06b6d4',
  warm1: '#f97316',
  warm2: '#eab308',
  seq: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f97316', '#ef4444', '#ec4899'],
  age: [
    [
      [0, '#ff6b35'],
      [1, '#ffd700'],
    ],
    [
      [0, '#56ab2f'],
      [1, '#a8e063'],
    ],
    [
      [0, '#0d7377'],
      [1, '#14ffec'],
    ],
    [
      [0, '#1a78c2'],
      [1, '#00c6fb'],
    ],
    [
      [0, '#1565c0'],
      [1, '#42a5f5'],
    ],
    [
      [0, '#6a0dad'],
      [1, '#a855f7'],
    ],
  ] as [number, string][][],
};

// ─────────────────────────────────────────────────────────────────────────────
// THEME TOKENS  — high-contrast text that works in both modes
// ─────────────────────────────────────────────────────────────────────────────
function tk(dark: boolean) {
  return {
    text: dark ? '#e2e8f0' : '#374151', // slate-200  /  gray-700
    subtext: dark ? '#94a3b8' : '#6b7280', // slate-400  /  gray-500
    axis: dark ? 'rgba(148,163,184,0.25)' : '#e5e7eb',
    grid: dark ? 'rgba(148,163,184,0.12)' : '#f3f4f6',
    bg: 'transparent',
    track: dark ? 'rgba(148,163,184,0.18)' : '#e8eaf6',
    tt: {
      bg: dark ? 'rgba(15,23,42,0.96)' : 'rgba(255,255,255,0.98)',
      border: dark ? 'rgba(148,163,184,0.3)' : '#e0e7ff',
      text: dark ? '#f1f5f9' : '#1e293b',
    },
  };
}

function tt(dark: boolean) {
  const c = tk(dark).tt;
  return {
    backgroundColor: c.bg,
    borderColor: c.border,
    borderWidth: 1,
    textStyle: { color: c.text, fontSize: 12, fontWeight: 500 as const },
    extraCssText: 'box-shadow:0 8px 24px rgba(0,0,0,.35);border-radius:10px;padding:8px 12px;',
  };
}

function lg(dir: 'h' | 'v', stops: [number, string][]) {
  const h = dir === 'h';
  return {
    type: 'linear' as const,
    x: 0,
    y: 0,
    x2: h ? 1 : 0,
    y2: h ? 0 : 1,
    colorStops: stops.map(([offset, color]) => ({ offset, color })),
  };
}

// ── Axis label shorthand ─────────────────────────────────────────────────────
function axl(dark: boolean, size = 11, fmt?: string) {
  const base = { color: tk(dark).text, fontSize: size, fontWeight: 500 as const };
  return fmt ? { ...base, formatter: fmt } : base;
}

// ── Hover helpers ────────────────────────────────────────────────────────────
const barBlur = { itemStyle: { opacity: 0.32 } };

function lineEmphasis(color: string) {
  return {
    focus: 'self' as const,
    itemStyle: { shadowBlur: 16, shadowColor: color + '99', borderWidth: 3 },
    lineStyle: { width: 4 },
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. VIEWERSHIP BY RUNS
// ═════════════════════════════════════════════════════════════════════════════
export function multiLineChart(dark = false): EChartsOption {
  const t = tk(dark);
  const x = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data = [12, 18, 24, 32, 41, 55, 68, 80, 89, 97, 108, 124];
  const color = PALETTE.primary;
  return {
    ...ANIM,
    backgroundColor: t.bg,
    tooltip: { ...tt(dark), trigger: 'axis' },
    grid: { top: 12, right: 12, bottom: 28, left: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: x,
      boundaryGap: false,
      axisLabel: axl(dark, 10),
      axisLine: { lineStyle: { color: t.axis } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: axl(dark, 10),
      axisLine: { show: false },
      splitLine: { lineStyle: { color: t.grid } },
    },
    series: [
      {
        name: 'Followers',
        type: 'line' as const,
        smooth: true,
        showSymbol: false,
        data,
        lineStyle: { color, width: 3 },
        itemStyle: { color },
        areaStyle: {
          color: lg('v', [
            [0, color + '55'],
            [1, color + '05'],
          ]),
        },
        emphasis: lineEmphasis(color),
      },
    ],
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. DONUT helper — NO center text, clean ring, outside label lines
// ═════════════════════════════════════════════════════════════════════════════
function donutBase(opts: {
  data: { name: string; value: number; color: string }[];
  dark?: boolean;
}): EChartsOption {
  const dark = opts.dark ?? false;
  const t = tk(dark);
  return {
    ...ANIM,
    backgroundColor: t.bg,
    tooltip: { ...tt(dark), trigger: 'item', formatter: '{b}: <strong>{d}%</strong>' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '52%'],
        avoidLabelOverlap: true,
        label: {
          show: true,
          position: 'outside' as const,
          color: t.text,
          fontSize: 11,
          fontWeight: 500 as const,
          formatter: '{b}',
          overflow: 'break' as const,
          width: 72,
          lineHeight: 15,
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 14,
          smooth: 0.3,
          lineStyle: { color: dark ? 'rgba(148,163,184,0.4)' : '#d1d5db', width: 1 },
        },
        data: opts.data.map((d) => ({
          name: d.name,
          value: d.value,
          itemStyle: { color: d.color, borderRadius: 4, borderWidth: 0 },
        })),
        // NO center graphic, NO label on hover — just a glow + lift
        emphasis: {
          scale: true,
          scaleSize: 7,
          label: { show: false },
          itemStyle: { shadowBlur: 22, shadowOffsetY: 6, shadowColor: 'rgba(0,0,0,0.22)' },
        },
        blur: { itemStyle: { opacity: 0.35 } },
      },
    ],
    // ← no `graphic` array at all = no center text
  };
}

export function donutChart(dark = false): EChartsOption {
  return donutBase({
    dark,
    data: [
      { name: 'Boring Content', value: 35, color: PALETTE.negative },
      { name: 'Grid Planning', value: 28, color: PALETTE.warm1 },
      { name: 'Issues with Presenters', value: 22, color: PALETTE.secondary },
      { name: 'Transparency', value: 15, color: PALETTE.accent },
    ],
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. TIME ANALYSIS — dual line: Reach vs Impressions
// ═════════════════════════════════════════════════════════════════════════════
export function lineChart(dark = false): EChartsOption {
  const t = tk(dark);
  const x = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data = [22, 28, 35, 42, 80, 95, 88, 72, 55, 42, 38, 30];
  const color = PALETTE.positive;
  return {
    ...ANIM,
    backgroundColor: t.bg,
    tooltip: { ...tt(dark), trigger: 'axis' },
    grid: { top: 12, right: 12, bottom: 28, left: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: x,
      axisLabel: axl(dark, 10),
      axisLine: { lineStyle: { color: t.axis } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: axl(dark, 10),
      axisLine: { show: false },
      splitLine: { lineStyle: { color: t.grid } },
    },
    series: [
      {
        name: 'Reach',
        type: 'line' as const,
        smooth: true,
        showSymbol: true,
        symbolSize: 5,
        data,
        lineStyle: { color, width: 3 },
        itemStyle: { color, borderWidth: 2 },
        areaStyle: {
          color: lg('v', [
            [0, color + '40'],
            [1, color + '05'],
          ]),
        },
        emphasis: lineEmphasis(color),
        blur: { lineStyle: { opacity: 0.25 }, itemStyle: { opacity: 0.2 } },
      },
    ],
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// 3b. REACH VS IMPRESSIONS — dual line (2 series)
// ═════════════════════════════════════════════════════════════════════════════
export function dualLineChart(dark = false): EChartsOption {
  const t = tk(dark);
  const x = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const series = [
    {
      name: 'Reach',
      data: [22, 28, 35, 42, 80, 95, 88, 72, 55, 42, 38, 30],
      color: PALETTE.positive,
    },
    {
      name: 'Impressions',
      data: [38, 44, 52, 60, 92, 108, 99, 85, 68, 55, 50, 44],
      color: PALETTE.accent,
    },
  ];
  return {
    ...ANIM,
    backgroundColor: t.bg,
    tooltip: { ...tt(dark), trigger: 'axis' },
    legend: {
      data: series.map((s) => s.name),
      bottom: 4,
      textStyle: { color: t.text, fontSize: 11, fontWeight: 500 },
      icon: 'roundRect',
      itemWidth: 16,
      itemHeight: 10,
    },
    grid: { top: 12, right: 12, bottom: 44, left: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: x,
      axisLabel: axl(dark, 10),
      axisLine: { lineStyle: { color: t.axis } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: axl(dark, 10),
      axisLine: { show: false },
      splitLine: { lineStyle: { color: t.grid } },
    },
    series: series.map((s) => ({
      name: s.name,
      type: 'line' as const,
      smooth: true,
      showSymbol: true,
      symbolSize: 5,
      data: s.data,
      lineStyle: { color: s.color, width: 3 },
      itemStyle: { color: s.color, borderWidth: 2 },
      areaStyle: {
        color: lg('v', [
          [0, s.color + '40'],
          [1, s.color + '05'],
        ]),
      },
      emphasis: lineEmphasis(s.color),
      blur: { lineStyle: { opacity: 0.25 }, itemStyle: { opacity: 0.2 } },
    })),
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. GENDER — half-donut (D-ring), male left / female right labels
// ═════════════════════════════════════════════════════════════════════════════
export function gaugeChart(dark = false): EChartsOption {
  const t = tk(dark);

  const data = [
    { value: 55, name: 'Male', color: PALETTE.male, light: '#67e8f9' },
    { value: 45, name: 'Female', color: PALETTE.female, light: '#fbcfe8' },
  ];

  const total = data.reduce((s, d) => s + d.value, 0);
  const percent = (v: number) => Math.round((v / total) * 100);

  return {
    ...ANIM,
    backgroundColor: t.bg,

    tooltip: {
      ...tt(dark),
      trigger: 'item',
      formatter: (p: any) => `${p.name}: <strong>${percent(p.value)}%</strong>`,
    },

    series: [
      {
        type: 'pie',
        radius: ['55%', '75%'],
        center: ['50%', '65%'],
        startAngle: 180,
        endAngle: 360,
        label: { show: false },
        labelLine: { show: false },

        data: [
          ...data.map((d) => ({
            value: d.value,
            name: d.name,
            itemStyle: {
              color: lg('h', [
                [0, d.light],
                [1, d.color],
              ]),
            },
          })),
          { value: 0, name: 'empty', itemStyle: { color: 'transparent' } },
        ],
      } as any,
    ],

    graphic: [
      // MALE ICON
      {
        type: 'group',
        left: '15%',
        top: '54%',
        children: [
          {
            type: 'circle',
            shape: { cx: 0, cy: 0, r: 8 },
            style: {
              fill: lg('h', [
                [0, '#67e8f9'],
                [1, PALETTE.male],
              ]),
            },
          },
          {
            type: 'rect',
            shape: { x: -3, y: 8, width: 6, height: 14, r: 2 },
            style: { fill: PALETTE.male },
          },
        ],
      },

      // FEMALE ICON
      {
        type: 'group',
        right: '15%',
        top: '52%',
        children: [
          {
            type: 'circle',
            shape: { cx: 0, cy: 0, r: 8 },
            style: {
              fill: lg('h', [
                [0, '#fbcfe8'],
                [1, PALETTE.female],
              ]),
            },
          },
          {
            type: 'polygon',
            shape: {
              points: [
                [-10, 10],
                [10, 10],
                [0, 28],
              ],
            },
            style: { fill: PALETTE.female },
          },
        ],
      },

      // MALE TEXT
      {
        type: 'text',
        left: '15%',
        top: '35%',
        style: {
          text: `${percent(data[0].value)}%\nMale`,
          fill: t.text,
          font: '600 15px Inter, sans-serif',
        },
      },

      // FEMALE TEXT
      {
        type: 'text',
        right: '12%',
        top: '35%',
        style: {
          text: `${percent(data[1].value)}%\nFemale`,
          fill: t.text,
          font: '600 15px Inter, sans-serif',
        },
      },
    ],
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// 5. EMOTION BREAKDOWN — Nightingale ROSE chart (roseType:'area')
//    Slices grow to different radii based on their value
// ═════════════════════════════════════════════════════════════════════════════
export function roseChart(dark = false): EChartsOption {
  const t = tk(dark);
  const data = [
    { name: 'Fear', value: 22, color: '#ef4444' },
    { name: 'Anger', value: 18, color: '#f97316' },
    { name: 'Disgust', value: 15, color: '#eab308' },
    { name: 'Anticipation', value: 12, color: '#84cc16' },
    { name: 'Joy', value: 12, color: PALETTE.positive },
    { name: 'Trust', value: 10, color: PALETTE.accent },
    { name: 'Surprise', value: 6, color: PALETTE.primary },
    { name: 'Sad', value: 5, color: PALETTE.secondary },
  ];
  return {
    ...ANIM,
    backgroundColor: t.bg,
    tooltip: { ...tt(dark), trigger: 'item', formatter: '{b}: <strong>{c} ({d}%)</strong>' },
    legend: {
      orient: 'vertical',
      right: 4,
      top: 'middle',
      textStyle: { color: t.text, fontSize: 10, fontWeight: 500 },
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 6,
    },
    series: [
      {
        type: 'pie',
        roseType: 'area' as const, // ← Nightingale mode: radius encodes value
        radius: ['16%', '66%'],
        center: ['36%', '52%'],
        label: { show: false },
        labelLine: { show: false },
        itemStyle: { borderRadius: 5, borderWidth: 0 },
        data: data.map((d) => ({ name: d.name, value: d.value, itemStyle: { color: d.color } })),
        emphasis: {
          scale: true,
          scaleSize: 6,
          label: { show: true, fontSize: 11, fontWeight: 'bold' as const, color: t.text },
          itemStyle: { shadowBlur: 20, shadowOffsetY: 5 },
        },
        blur: { itemStyle: { opacity: 0.3 } },
      },
    ],
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// 6. AGE BRACKETS — stacked horizontal bar, Male vs Female per bracket
// ═════════════════════════════════════════════════════════════════════════════
export function stackedBarChart(dark = false): EChartsOption {
  const t = tk(dark);
  const cats = ['18 - 24', '25 - 34', '35 - 44', '45 - 54', '55 - 64', '65 +'];
  const male = [42, 30, 38, 22, 28, 16];
  const female = [36, 22, 27, 16, 22, 12];
  return {
    ...ANIM,
    backgroundColor: t.bg,
    tooltip: { ...tt(dark), trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {
      data: [
        { name: 'Male', itemStyle: { color: PALETTE.male } },
        { name: 'Female', itemStyle: { color: PALETTE.female } },
      ],
      bottom: 4,
      textStyle: { color: t.text, fontSize: 11, fontWeight: 500 },
      icon: 'roundRect',
      itemWidth: 16,
      itemHeight: 10,
    },
    grid: { top: 8, right: 24, bottom: 36, left: 8, containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: axl(dark, 11),
      axisLine: { lineStyle: { color: t.axis } },
      splitLine: { lineStyle: { color: t.grid } },
    },
    yAxis: {
      type: 'category',
      data: cats,
      inverse: true,
      axisLabel: axl(dark, 11),
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        name: 'Male',
        type: 'bar' as const,
        stack: 'age',
        barMaxWidth: 26,
        data: male.map((v) => ({
          value: v,
          itemStyle: { color: PALETTE.male, borderRadius: [5, 0, 0, 5] as any },
        })),
        emphasis: {
          focus: 'self' as const,
          itemStyle: { shadowBlur: 16, shadowColor: PALETTE.male + '88' },
        },
        blur: barBlur,
      },
      {
        name: 'Female',
        type: 'bar' as const,
        stack: 'age',
        barMaxWidth: 26,
        data: female.map((v) => ({
          value: v,
          itemStyle: { color: PALETTE.female, borderRadius: [0, 5, 5, 0] as any },
        })),
        emphasis: {
          focus: 'self' as const,
          itemStyle: { shadowBlur: 16, shadowColor: PALETTE.female + '88' },
        },
        blur: barBlur,
      },
    ],
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// 7. POLITICAL SENTIMENT
// ═════════════════════════════════════════════════════════════════════════════
export function groupedBarChart(dark = false): EChartsOption {
  const t = tk(dark);
  const cats = [
    'Candidate A',
    'Leader B',
    'Leader C',
    'Leader D',
    'Candidate E',
    'Candidate F',
    'Candidate G',
    'Leader H',
  ];
  const pos = [55, 52, 38, 32, 44, 20, 28, 12];
  const neg = [38, 30, 22, 28, 15, 18, 20, 8];
  return {
    ...ANIM,
    backgroundColor: t.bg,
    tooltip: { ...tt(dark), trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {
      data: ['Positive', 'Negative'],
      bottom: 4,
      textStyle: { color: t.text, fontSize: 11, fontWeight: 500 },
      icon: 'roundRect',
      itemWidth: 16,
      itemHeight: 10,
    },
    grid: { top: 8, right: 12, bottom: 38, left: 8, containLabel: true },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: axl(dark, 10),
      axisLine: { lineStyle: { color: t.axis } },
      splitLine: { lineStyle: { color: t.grid } },
    },
    yAxis: {
      type: 'category',
      data: cats,
      inverse: true,
      axisLabel: { ...axl(dark, 10), overflow: 'truncate' as const, width: 85 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        name: 'Positive',
        type: 'bar',
        stack: 'total',
        barMaxWidth: 24,
        data: pos,
        itemStyle: {
          color: lg('h', [
            [0, PALETTE.positive + 'dd'],
            [1, PALETTE.positive],
          ]),
          borderRadius: [5, 0, 0, 5],
        },
        emphasis: {
          focus: 'self' as const,
          itemStyle: { shadowBlur: 16, shadowColor: PALETTE.positive + '88' },
        },
        blur: barBlur,
      },
      {
        name: 'Negative',
        type: 'bar',
        stack: 'total',
        barMaxWidth: 24,
        data: neg,
        itemStyle: {
          color: lg('h', [
            [0, PALETTE.negative + 'dd'],
            [1, PALETTE.negative],
          ]),
          borderRadius: [0, 5, 5, 0],
        },
        emphasis: {
          focus: 'self' as const,
          itemStyle: { shadowBlur: 16, shadowColor: PALETTE.negative + '88' },
        },
        blur: barBlur,
      },
    ],
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// 8. ELECTION POLL
// ═════════════════════════════════════════════════════════════════════════════
export function barChart(dark = false): EChartsOption {
  const t = tk(dark);
  const candidates = ['Candidate A', 'Candidate B', 'Candidate C', 'Candidate D', 'Candidate E'];
  const vals = [42, 28, 15, 10, 5];
  const colors = [
    PALETTE.primary,
    PALETTE.accent,
    PALETTE.positive,
    PALETTE.neutral,
    PALETTE.secondary,
  ];
  return {
    ...ANIM,
    backgroundColor: t.bg,
    tooltip: {
      ...tt(dark),
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (p: any) => {
        const a = Array.isArray(p) ? p : [p];
        return a.map((i: any) => `<strong>${i.name}</strong>: ${i.value}%`).join('<br/>');
      },
    },
    grid: { top: 16, right: 20, bottom: 40, left: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: candidates,
      axisLabel: { ...axl(dark, 10), overflow: 'truncate' as const, width: 60 },
      axisLine: { lineStyle: { color: t.axis } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      max: 50,
      axisLabel: { ...axl(dark, 10), formatter: (v: number) => v + '%' },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: t.grid } },
    },
    series: [
      {
        type: 'bar' as const,
        barMaxWidth: 40,
        data: vals.map((v, i) => ({
          value: v,
          itemStyle: {
            color: lg('v', [
              [0, colors[i]],
              [1, colors[i] + '88'],
            ]),
            borderRadius: [6, 6, 0, 0],
          },
        })),
        label: {
          show: true,
          position: 'top' as const,
          formatter: '{c}%',
          color: t.text,
          fontSize: 11,
          fontWeight: 500 as const,
        },
        emphasis: { focus: 'self' as const, itemStyle: { shadowBlur: 18, shadowOffsetY: 4 } },
        blur: barBlur,
      },
    ],
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// 9. REGIONAL SENTIMENT
// ═════════════════════════════════════════════════════════════════════════════
export function mapChart(dark = false): EChartsOption {
  const t = tk(dark);
  const regions = [
    'North America',
    'Western Europe',
    'Middle East',
    'East Asia',
    'South Asia',
    'Africa',
    'Latin America',
    'Oceania',
  ];
  const vals = [72, 65, 32, 55, 44, 38, 60, 68];
  const colorOf = (v: number) =>
    v >= 65
      ? PALETTE.accent
      : v >= 50
        ? PALETTE.primary
        : v >= 40
          ? PALETTE.secondary
          : PALETTE.negative;
  return {
    ...ANIM,
    backgroundColor: t.bg,
    tooltip: {
      ...tt(dark),
      trigger: 'axis',
      formatter: (p: any) => {
        const a = Array.isArray(p) ? p : [p];
        return a.map((i: any) => `<strong>${i.axisValueLabel}</strong>: ${i.value}%`).join('<br/>');
      },
    },
    grid: { top: 8, right: 48, bottom: 28, left: 8, containLabel: true },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: axl(dark, 11, '{value}%'),
      axisLine: { lineStyle: { color: t.axis } },
      splitLine: { lineStyle: { color: t.grid } },
    },
    yAxis: {
      type: 'category',
      data: regions,
      inverse: true,
      axisLabel: axl(dark, 11),
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 24,
        data: vals.map((v) => ({
          value: v,
          itemStyle: { color: colorOf(v), borderRadius: [0, 6, 6, 0] },
        })),
        label: {
          show: true,
          position: 'right' as const,
          formatter: '{c}%',
          color: t.text,
          fontSize: 11,
          fontWeight: 500 as const,
        },
        emphasis: { focus: 'self' as const, itemStyle: { shadowBlur: 18, shadowOffsetY: 4 } },
        blur: barBlur,
      },
    ],
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// 11. SOCIAL CLASS — clean basic pie with left legend (no graphics overlay)
// ═════════════════════════════════════════════════════════════════════════════
export function pieChart(dark = false): EChartsOption {
  const t = tk(dark);
  const data = [
    {
      name: 'Class A',
      value: 23,
      color: lg('v', [
        [0, PALETTE.secondary],
        [1, '#c4b5fd'],
      ]),
    },
    {
      name: 'Class B',
      value: 54,
      color: lg('v', [
        [0, PALETTE.accent],
        [1, '#67e8f9'],
      ]),
    },
    {
      name: 'Class C',
      value: 23,
      color: lg('v', [
        [0, PALETTE.positive],
        [1, '#6ee7b7'],
      ]),
    },
  ];
  return {
    ...ANIM,
    backgroundColor: t.bg,
    tooltip: { ...tt(dark), trigger: 'item', formatter: '{b}: <strong>{d}%</strong>' },
    legend: {
      orient: 'vertical',
      left: 4,
      top: 'middle',
      textStyle: { color: t.text, fontSize: 12, fontWeight: 500 },
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 12,
    },
    series: [
      {
        type: 'pie',
        radius: ['0%', '68%'],
        center: ['62%', '52%'],
        label: { show: false },
        labelLine: { show: false },
        itemStyle: {
          borderWidth: 2,
          borderColor: dark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.85)',
          borderRadius: 4,
        },
        data: data.map((d) => ({ name: d.name, value: d.value, itemStyle: { color: d.color } })),
        emphasis: {
          scale: true,
          scaleSize: 7,
          label: { show: false },
          itemStyle: { shadowBlur: 18, shadowColor: 'rgba(0,0,0,0.25)' },
        },
        blur: { itemStyle: { opacity: 0.4 } },
      },
    ],
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// 13. BUYING CYCLE
// ═════════════════════════════════════════════════════════════════════════════
export function horizontalBarChart(dark = false): EChartsOption {
  const t = tk(dark);
  const cats = ['Trigger', 'Consider', 'Choose', 'Buy', 'Good Exp.', 'Bad Exp.'];
  const vals = [92, 80, 65, 55, 45, 30];
  const colors = PALETTE.seq;
  return {
    ...ANIM,
    backgroundColor: t.bg,
    tooltip: { ...tt(dark), trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { top: 8, right: 28, bottom: 28, left: 0, containLabel: true },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: axl(dark, 10),
      axisLine: { lineStyle: { color: t.axis } },
      splitLine: { lineStyle: { color: t.grid } },
    },
    yAxis: {
      type: 'category',
      data: cats,
      inverse: true,
      axisLabel: axl(dark, 10),
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 22,
        data: vals.map((v, i) => ({
          value: v,
          itemStyle: {
            color: lg('h', [
              [0, colors[i] + 'bb'],
              [1, colors[i]],
            ]),
            borderRadius: [0, 6, 6, 0],
          },
        })),
        emphasis: { focus: 'self' as const, itemStyle: { shadowBlur: 18, shadowOffsetY: 4 } },
        blur: barBlur,
      },
    ],
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// 14. WATCHING TRIGGERS
// ═════════════════════════════════════════════════════════════════════════════
export function rankedBarChart(dark = false): EChartsOption {
  const t = tk(dark);
  const cats = [
    'For Their Talkshows',
    'For Celebs',
    'TV Series Airing',
    'News',
    'Got Watch It',
    'Sports Content',
    'New English Movies',
    'Others',
  ];
  const vals = [88, 82, 71, 65, 58, 49, 38, 26];
  const colors = PALETTE.seq;
  return {
    ...ANIM,
    backgroundColor: t.bg,
    tooltip: { ...tt(dark), trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { top: 8, right: 28, bottom: 28, left: 0, containLabel: true },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: axl(dark, 10, '{value}%'),
      axisLine: { lineStyle: { color: t.axis } },
      splitLine: { lineStyle: { color: t.grid } },
    },
    yAxis: {
      type: 'category',
      data: cats,
      inverse: true,
      axisLabel: { ...axl(dark, 10), overflow: 'truncate' as const, width: 115 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 18,
        data: vals.map((v, i) => ({
          value: v,
          itemStyle: {
            color: lg('h', [
              [0, colors[i] + '99'],
              [1, colors[i]],
            ]),
            borderRadius: [0, 6, 6, 0],
          },
        })),
        emphasis: { focus: 'self' as const, itemStyle: { shadowBlur: 18, shadowOffsetY: 4 } },
        blur: barBlur,
      },
    ],
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// 16. COUNT KPI CARD — ECharts arc-gauge representation
//     Replaces the plain HTML number card with a proper chart
//     Usage: countKpiChart({ value:1234, max:2000, label:'Total Views', color:PALETTE.primary })
// ═════════════════════════════════════════════════════════════════════════════
export function countKpiChart(opts: {
  value: number;
  max?: number;
  label: string;
  unit?: string;
  color?: string;
  dark?: boolean;
}): EChartsOption {
  const dark = opts.dark ?? false;
  const t = tk(dark);
  const color = opts.color ?? PALETTE.primary;
  // Safe auto-scale: works for decimals (e.g. 4.8), integers and large numbers.
  // Rounds up to the next clean magnitude above the value.
  function safeMax(v: number): number {
    if (v <= 0 || !isFinite(v)) return 100;
    const exp = Math.pow(10, Math.floor(Math.log10(v))); // e.g. 4.8→1, 842→100
    return Math.ceil(v / exp) * exp; // e.g. 4.8→5, 842→900
  }
  const max = opts.max ?? safeMax(opts.value);
  const pct = Math.min(100, Math.round((opts.value / max) * 100));

  return {
    ...ANIM,
    backgroundColor: t.bg,
    series: ((): GaugeSeriesOption[] => {
      const arc = (axColor: any, val: number, extra?: any): GaugeSeriesOption =>
        ({
          type: 'gauge',
          center: ['50%', '60%'],
          radius: '82%',
          startAngle: 200,
          endAngle: -20,
          min: 0,
          max: 100,
          splitNumber: 0,
          axisLine: { lineStyle: { width: 20, color: [[1, axColor]] } },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          pointer: { show: false },
          detail: { show: false },
          data: [{ value: val }],
          ...extra,
        }) as unknown as GaugeSeriesOption;

      return [
        // Track ring (background)
        arc(dark ? 'rgba(148,163,184,0.14)' : 'rgba(0,0,0,0.06)', 100, { silent: true }),
        // Progress arc with gradient
        arc(
          lg('h', [
            [0, color + '99'],
            [0.7, color + 'dd'],
            [1, color],
          ]),
          pct,
          {
            emphasis: { itemStyle: { shadowBlur: 12, shadowColor: color + '55' } },
          },
        ),
      ];
    })(),
    graphic: [
      // Big number
      {
        type: 'text' as const,
        left: 'center',
        top: '30%',
        style: {
          text:
            opts.value >= 1000
              ? opts.value >= 1_000_000
                ? `${(opts.value / 1_000_000).toFixed(1)}M`
                : `${(opts.value / 1000).toFixed(1)}K`
              : String(opts.value),
          font: `800 clamp(1.6rem,3.5vw,2.2rem) Inter,sans-serif`,
          fill: dark ? '#f1f5f9' : '#1e293b',
        },
      },
      // Label below number
      {
        type: 'text' as const,
        left: 'center',
        top: '50%',
        style: {
          text: opts.label,
          font: `500 12px Inter,sans-serif`,
          fill: t.subtext,
        },
      },
      // Percentage of target at bottom of arc
      {
        type: 'text' as const,
        left: 'center',
        top: '68%',
        style: {
          text: `${pct}% of target`,
          font: `600 11px Inter,sans-serif`,
          fill: color,
        },
      },
    ],
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// PREVIEW CHARTS (modal thumbnails — no animation, no axes)
// ═════════════════════════════════════════════════════════════════════════════
// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW CHART FUNCTIONS — used in the AI modal template cards
// Each type has its OWN colour palette so every card feels distinct.
// ─────────────────────────────────────────────────────────────────────────────

// Line / Area — teal–cyan family
export function previewLineChart(_accentColor: string): EChartsOption {
  const c = '#06b6d4';
  return {
    animation: false,
    backgroundColor: 'transparent',
    grid: { top: 8, right: 0, bottom: 8, left: 0, containLabel: false },
    xAxis: { show: false, type: 'category', data: [0, 1, 2, 3, 4, 5, 6], boundaryGap: false },
    yAxis: { show: false, type: 'value' },
    series: [
      {
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: [3, 5, 4, 7, 6, 8, 7],
        lineStyle: { color: c, width: 2.5 },
        areaStyle: { color: c + '30' },
        itemStyle: { color: c },
      },
      {
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: [5, 4, 6, 5, 7, 5, 6],
        lineStyle: { color: c + 'aa', width: 1.5 },
        areaStyle: { color: c + '15' },
        itemStyle: { color: c },
      },
    ],
  };
}

// Bar — orange–amber family, step-opacity per bar (same technique as dashboard bars)
export function previewBarChart(_accentColor: string, horizontal = false): EChartsOption {
  const base = '#f97316';
  const steps = horizontal
    ? [base, base + 'cc', base + 'aa', base + '88', base + '66']
    : [base + '55', base + '77', base + '99', base + 'bb', base];
  const data = [3, 5, 4, 6, 4.5].map((v, i) => ({
    value: v,
    itemStyle: { color: steps[i], borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0] },
  }));
  return {
    animation: false,
    backgroundColor: 'transparent',
    grid: { top: 4, right: 0, bottom: 4, left: 0, containLabel: false },
    ...(horizontal
      ? {
          xAxis: { show: false, type: 'value' },
          yAxis: { show: false, type: 'category', data: ['a', 'b', 'c', 'd', 'e'] },
        }
      : {
          xAxis: { show: false, type: 'category', data: ['a', 'b', 'c', 'd', 'e'] },
          yAxis: { show: false, type: 'value' },
        }),
    series: [{ type: 'bar', data, barMaxWidth: horizontal ? 10 : 18 }],
  };
}

// Donut — indigo→violet family, 4 slices stepping full→faint
export function previewDonutChart(_colors: string[]): EChartsOption {
  const b = '#6366f1';
  return {
    animation: false,
    backgroundColor: 'transparent',
    series: [
      {
        type: 'pie',
        radius: ['42%', '70%'],
        center: ['50%', '50%'],
        label: { show: false },
        labelLine: { show: false },
        data: [35, 25, 22, 18].map((v, i) => ({
          value: v,
          itemStyle: {
            color: [b, b + 'cc', b + '88', b + '44'][i],
            borderRadius: 3,
            borderWidth: 0,
          },
        })),
      },
    ],
  };
}

// Pie — red→orange→amber family
export function previewPieChart(_colors: string[]): EChartsOption {
  return {
    animation: false,
    backgroundColor: 'transparent',
    series: [
      {
        type: 'pie',
        radius: ['0%', '68%'],
        center: ['50%', '50%'],
        label: { show: false },
        labelLine: { show: false },
        itemStyle: { borderWidth: 0 },
        data: [40, 35, 25].map((v, i) => ({
          value: v,
          itemStyle: { color: ['#ef4444', '#f97316', '#fbbf24'][i], borderRadius: 3 },
        })),
      },
    ],
  };
}

// Rose (Nightingale) — alternating emerald / violet, 8 petals fading outward
export function previewRoseChart(_colors: string[]): EChartsOption {
  const em = '#10b981',
    vi = '#8b5cf6';
  const steps = [em, vi, em + 'dd', vi + 'dd', em + 'aa', vi + 'aa', em + '66', vi + '66'];
  return {
    animation: false,
    backgroundColor: 'transparent',
    series: [
      {
        type: 'pie',
        roseType: 'area' as const,
        radius: ['14%', '68%'],
        center: ['50%', '50%'],
        label: { show: false },
        labelLine: { show: false },
        itemStyle: { borderRadius: 4, borderWidth: 0 },
        data: [22, 18, 15, 12, 12, 10, 6, 5].map((v, i) => ({
          value: v,
          itemStyle: { color: steps[i] },
        })),
      },
    ],
  };
}

// Gauge — sky / pink side-by-side
export function previewGaugeChart(_color: string): EChartsOption {
  return {
    animation: false,
    backgroundColor: 'transparent',
    series: ((): GaugeSeriesOption[] => {
      const g = (center: string[], axColor: string, val: number, extra?: any): GaugeSeriesOption =>
        ({
          type: 'gauge',
          center,
          radius: '44%',
          startAngle: 225,
          endAngle: -45,
          min: 0,
          max: 100,
          splitNumber: 0,
          axisLine: { lineStyle: { width: 10, color: [[1, axColor]] as [number, string][] } },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: { show: false },
          pointer: { show: false },
          data: [{ value: val }],
          ...extra,
        }) as unknown as GaugeSeriesOption;
      return [
        g(['32%', '52%'], 'rgba(0,0,0,0.08)', 100, { silent: true }),
        g(['32%', '52%'], '#0ea5e9', 38),
        g(['68%', '52%'], 'rgba(0,0,0,0.08)', 100, { silent: true }),
        g(['68%', '52%'], '#ec4899', 45),
      ];
    })(),
  };
}

// Gender chart mini-preview — semicircle pie + ♂ / ♀ icons
export function previewGenderChart(): EChartsOption {
  return {
    animation: false,
    backgroundColor: 'transparent',
    series: [
      {
        type: 'pie',
        radius: ['50%', '72%'],
        center: ['50%', '72%'],
        startAngle: 180,
        endAngle: 360,
        label: { show: false },
        labelLine: { show: false },
        data: [
          { value: 55, name: 'Male', itemStyle: { color: '#38bdf8' } },
          { value: 45, name: 'Female', itemStyle: { color: '#f472b6' } },
          { value: 0, name: '', itemStyle: { color: 'transparent' } },
        ],
      } as any,
    ],
    graphic: [
      {
        type: 'text',
        left: '18%',
        top: '22%',
        style: { text: '♂', font: 'bold 14px sans-serif', fill: '#38bdf8' },
      },
      {
        type: 'text',
        right: '18%',
        top: '22%',
        style: { text: '♀', font: 'bold 14px sans-serif', fill: '#f472b6' },
      },
    ],
  };
}

// Stacked Bar — sky (Male) + pink (Female) per age group, 4 rows
export function previewStackedBarChart(): EChartsOption {
  const male = '#0ea5e9';
  const female = '#ec4899';
  const vals = [42, 30, 38, 22]; // male per group
  const vals2 = [36, 22, 27, 16]; // female per group
  const cats = ['18-24', '25-34', '35-44', '45-54'];
  return {
    animation: false,
    backgroundColor: 'transparent',
    grid: { top: 2, right: 6, bottom: 2, left: 30, containLabel: false },
    xAxis: { show: false, type: 'value' },
    yAxis: {
      show: true,
      type: 'category',
      data: cats,
      axisLabel: { color: '#94a3b8', fontSize: 9, fontWeight: 500 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar' as const,
        stack: 's',
        barMaxWidth: 12,
        data: vals,
        itemStyle: { color: male, borderRadius: [3, 0, 0, 3] },
      },
      {
        type: 'bar' as const,
        stack: 's',
        barMaxWidth: 12,
        data: vals2,
        itemStyle: { color: female, borderRadius: [0, 3, 3, 0] },
      },
    ],
  };
}

// Grouped Bar — positive (green) + negative (red) side-by-side, 4 candidates
export function previewGroupedBarChart(): EChartsOption {
  const pos = '#10b981';
  const neg = '#ef4444';
  const posVals = [55, 52, 38, 32];
  const negVals = [38, 30, 22, 28];
  const cats = ['A', 'B', 'C', 'D'];
  return {
    animation: false,
    backgroundColor: 'transparent',
    grid: { top: 2, right: 6, bottom: 2, left: 16, containLabel: false },
    xAxis: { show: false, type: 'value' },
    yAxis: {
      show: true,
      type: 'category',
      data: cats,
      axisLabel: { color: '#94a3b8', fontSize: 9, fontWeight: 500 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar' as const,
        barMaxWidth: 8,
        data: posVals,
        itemStyle: { color: pos, borderRadius: [0, 3, 3, 0] },
      },
      {
        type: 'bar' as const,
        barMaxWidth: 8,
        data: negVals,
        itemStyle: { color: neg, borderRadius: [0, 3, 3, 0] },
      },
    ],
  };
}

// Multi-Line preview — 3 distinct coloured lines (matches multiLineChart)
// Area chart preview (single line with fill) — Follower Growth
export function previewMultiLineChart(): EChartsOption {
  const color = '#6366f1';
  const data = [12, 18, 24, 32, 41, 55, 68, 80, 89, 97];
  return {
    animation: false,
    backgroundColor: 'transparent',
    grid: { top: 8, right: 0, bottom: 8, left: 0, containLabel: false },
    xAxis: { show: false, type: 'category', data: data.map((_, i) => i), boundaryGap: false },
    yAxis: { show: false, type: 'value' },
    series: [
      {
        type: 'line' as const,
        smooth: true,
        showSymbol: false,
        data,
        lineStyle: { color, width: 2.5 },
        areaStyle: { color: color + '44' },
        itemStyle: { color },
      },
    ],
  };
}

// Dual-line preview — 2 lines (Reach + Impressions)
export function previewDualLineChart(): EChartsOption {
  const s1 = { data: [22, 28, 35, 42, 80, 95, 88, 72, 55, 42], color: '#10b981' };
  const s2 = { data: [38, 44, 52, 60, 92, 108, 99, 85, 68, 55], color: '#06b6d4' };
  return {
    animation: false,
    backgroundColor: 'transparent',
    grid: { top: 8, right: 0, bottom: 8, left: 0, containLabel: false },
    xAxis: { show: false, type: 'category', data: s1.data.map((_, i) => i), boundaryGap: false },
    yAxis: { show: false, type: 'value' },
    series: [s1, s2].map((s) => ({
      type: 'line' as const,
      smooth: true,
      showSymbol: false,
      data: s.data,
      lineStyle: { color: s.color, width: 2 },
      areaStyle: { color: s.color + '22' },
      itemStyle: { color: s.color },
    })),
  };
}

// Vertical bar preview — Election Poll
export function previewBarVerticalChart(): EChartsOption {
  const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];
  const vals = [42, 28, 15, 10, 5];
  return {
    animation: false,
    backgroundColor: 'transparent',
    grid: { top: 4, right: 4, bottom: 4, left: 4, containLabel: false },
    xAxis: { show: false, type: 'category', data: vals.map((_, i) => i) },
    yAxis: { show: false, type: 'value' },
    series: [
      {
        type: 'bar' as const,
        barMaxWidth: 18,
        data: vals.map((v, i) => ({
          value: v,
          itemStyle: { color: colors[i], borderRadius: [4, 4, 0, 0] },
        })),
      },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CHART TYPE REGISTRY
//
// Keys are GENERIC chart-type identifiers — they describe the visualisation
// shape, not the business data inside it.  The internal render functions still
// use their descriptive names; only the public-facing type tokens are generic
// so containers / API routes / GridItem.chartType remain stable regardless of
// what dataset is plugged in later.
//
// Mapping:
//   line-chart          ← lineChart      (multi-line trend)
//   multi-line-chart    ← multiLineChart   (multiple run lines)
//   gauge-chart         ← gaugeChart             (two side-by-side gauges)
//   donut-chart         ← donutChart  (ring / donut)
//   rose-chart          ← roseChart       (Nightingale rose)
//   stacked-bar-chart   ← stackedBarChart        (horizontal stacked bar)
//   grouped-bar-chart   ← groupedBarChart (vertical grouped bar)
//   bar-chart           ← barChart       (simple vertical bar)
//   map-chart           ← mapChart  (map / geo chart)
//   pie-chart           ← pieChart        (basic pie)
//   horizontal-bar-chart← horizontalBarChart        (horizontal bar funnel)
//   ranked-bar-chart    ← rankedBarChart   (horizontal ranked bar)

// ═════════════════════════════════════════════════════════════════════════════
// GLOBE / WORLD SCATTER — beautiful 3D-styled world visualization
// Uses echarts-gl if available; gracefully falls back to a standard ECharts
// polar/scatter chart that evokes a globe aesthetic.
//
// To enable the real 3D globe:
//   npm install echarts-gl
//   Import in main.ts: import 'echarts-gl';
// ═════════════════════════════════════════════════════════════════════════════
export function globeChart(dark = false): EChartsOption {
  const t = tk(dark);

  // World data points: [longitude, latitude, value] for major cities
  const points = [
    // Americas
    [-74.006, 40.7128, 85], // New York
    [-118.243, 34.0522, 78], // Los Angeles
    [-99.1332, 19.4326, 72], // Mexico City
    [-46.6333, -23.5505, 68], // São Paulo
    [-43.1729, -22.9068, 62], // Rio
    [-79.3832, 43.6532, 55], // Toronto
    [-58.3816, -34.6037, 48], // Buenos Aires
    // Europe
    [-0.1276, 51.5074, 92], // London
    [2.3522, 48.8566, 88], // Paris
    [13.405, 52.52, 80], // Berlin
    [37.6173, 55.7558, 75], // Moscow
    [12.4964, 41.9028, 70], // Rome
    [3.7038, 40.4168, 65], // Madrid
    [4.9041, 52.3676, 60], // Amsterdam
    // Asia
    [121.474, 31.2304, 95], // Shanghai
    [116.407, 39.9042, 90], // Beijing
    [139.692, 35.6895, 88], // Tokyo
    [72.8777, 19.076, 82], // Mumbai
    [103.819, 1.352, 78], // Singapore
    [126.978, 37.5665, 72], // Seoul
    [55.2708, 25.2048, 68], // Dubai
    [31.2357, 30.0444, 60], // Cairo
    // Africa / Oceania
    [18.4241, -33.9249, 52], // Cape Town
    [28.0473, -26.2041, 48], // Johannesburg
    [151.209, -33.8688, 65], // Sydney
  ];

  const color = PALETTE.accent;
  const colorScale = (v: number) => {
    const t = (v - 40) / 60; // normalize 40-100 → 0-1
    const r = Math.round(6 + t * (0 - 6));
    const g = Math.round(182 + t * (200 - 182));
    const b = Math.round(212 + t * (255 - 212));
    return `rgb(${r},${g},${b})`;
  };

  return {
    ...ANIM,
    backgroundColor: t.bg,
    tooltip: {
      ...tt(dark),
      trigger: 'item',
      formatter: (p: any) => {
        const [lon, lat, val] = p.value;
        return `<strong>${p.seriesName}</strong><br/>Reach: <b>${val}%</b><br/><small>${lat.toFixed(1)}°, ${lon.toFixed(1)}°</small>`;
      },
    },
    // Polar coordinate system creates a round "globe-like" appearance
    polar: { center: ['50%', '50%'], radius: '82%' },
    radiusAxis: {
      type: 'value' as const,
      min: -90,
      max: 90,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: {
        lineStyle: {
          color: dark ? 'rgba(0,200,255,0.08)' : 'rgba(0,120,200,0.10)',
          width: 1,
        },
      },
    },
    angleAxis: {
      type: 'value' as const,
      min: -180,
      max: 180,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: {
        show: true,
        lineStyle: {
          color: dark ? 'rgba(0,200,255,0.06)' : 'rgba(0,120,200,0.08)',
        },
      },
    },
    series: [
      // Globe outline circle
      {
        type: 'line' as const,
        coordinateSystem: 'polar' as const,
        data: Array.from({ length: 361 }, (_, i) => [i - 180, 88]),
        lineStyle: {
          color: dark ? 'rgba(0,200,255,0.22)' : 'rgba(0,120,200,0.18)',
          width: 1.5,
          type: 'solid' as const,
        },
        symbol: 'none',
        name: '',
        silent: true,
      },
      // Inner grid circles (latitude lines)
      ...([60, 30, 0, -30, -60] as number[]).map((lat) => ({
        type: 'line' as const,
        coordinateSystem: 'polar' as const,
        data: Array.from({ length: 361 }, (_: unknown, i: number) => [i - 180, lat]),
        lineStyle: {
          color: dark ? 'rgba(0,200,255,0.07)' : 'rgba(0,120,200,0.07)',
          width: 1,
          type: 'dashed' as const,
        },
        symbol: 'none',
        name: '',
        silent: true,
      })),
      // Data points — city reach values
      {
        name: 'Global Reach',
        type: 'scatter' as const,
        coordinateSystem: 'polar' as const,
        data: points.map(([lon, lat, val]) => ({
          value: [lon, lat, val],
          itemStyle: {
            color: colorScale(val),
            opacity: 0.85,
          },
          symbolSize: 4 + (val / 100) * 10,
        })),
        emphasis: {
          focus: 'self' as const,
          itemStyle: { shadowBlur: 20, shadowColor: color + '88' },
        },
      },
      // Pulse rings on top cities
      {
        name: 'Hot Spots',
        type: 'scatter' as const,
        coordinateSystem: 'polar' as const,
        data: [
          [121.474, 31.2304, 95],
          [-0.1276, 51.5074, 92],
          [139.692, 35.6895, 88],
          [116.407, 39.9042, 90],
        ].map(([lon, lat, val]) => ({
          value: [lon, lat, val],
          itemStyle: {
            color: 'transparent',
            borderColor: colorScale(val as number),
            borderWidth: 2,
            opacity: 0.7,
          },
          symbolSize: 18,
        })),
        silent: true,
        animation: true,
      },
    ],
    graphic: [
      {
        type: 'text' as const,
        left: 'center',
        bottom: 8,
        style: {
          text: '● Global Audience Distribution',
          font: `500 11px Inter, sans-serif`,
          fill: t.subtext,
        },
      },
    ],
  } as any;
}

// Preview for globe chart (modal thumbnail)
export function previewGlobeChart(): EChartsOption {
  return {
    animation: false,
    backgroundColor: 'transparent',
    polar: { center: ['50%', '50%'], radius: '80%' },
    radiusAxis: {
      type: 'value' as const,
      min: -90,
      max: 90,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { lineStyle: { color: 'rgba(0,200,255,0.10)', width: 1 } },
    },
    angleAxis: {
      type: 'value' as const,
      min: -180,
      max: 180,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: true, lineStyle: { color: 'rgba(0,200,255,0.07)' } },
    },
    series: [
      {
        type: 'line' as const,
        coordinateSystem: 'polar' as const,
        data: Array.from({ length: 361 }, (_, i) => [i - 180, 87]),
        lineStyle: { color: 'rgba(0,200,255,0.30)', width: 1.5, type: 'solid' as const },
        symbol: 'none',
        name: '',
        silent: true,
      },
      {
        type: 'scatter' as const,
        coordinateSystem: 'polar' as const,
        data: [
          [121, 31, 95],
          [0, 52, 92],
          [140, 36, 88],
          [116, 40, 90],
          [-74, 41, 85],
          [2, 49, 88],
          [-118, 34, 78],
        ].map(([lon, lat, v]) => ({
          value: [lon, lat, v],
          itemStyle: { color: `hsl(${180 + v},80%,${55 + v / 10}%)`, opacity: 0.85 },
          symbolSize: 3 + v / 20,
        })),
      },
    ],
  } as any;
}

// ─────────────────────────────────────────────────────────────────────────────
// CHART TYPE REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
export type DashboardChartType =
  | 'line-chart'
  | 'multi-line-chart'
  | 'dual-line-chart'
  | 'gauge-chart'
  | 'donut-chart'
  | 'rose-chart'
  | 'stacked-bar-chart'
  | 'grouped-bar-chart'
  | 'bar-chart'
  | 'map-chart'
  | 'pie-chart'
  | 'horizontal-bar-chart'
  | 'ranked-bar-chart'
  | 'globe-chart';

export function getChartOption(type: DashboardChartType, dark = false): EChartsOption {
  switch (type) {
    case 'line-chart':
      return lineChart(dark);
    case 'multi-line-chart':
      return multiLineChart(dark);
    case 'dual-line-chart':
      return dualLineChart(dark);
    case 'gauge-chart':
      return gaugeChart(dark);
    case 'donut-chart':
      return donutChart(dark);
    case 'rose-chart':
      return roseChart(dark);
    case 'stacked-bar-chart':
      return stackedBarChart(dark);
    case 'grouped-bar-chart':
      return groupedBarChart(dark);
    case 'bar-chart':
      return barChart(dark);
    case 'map-chart':
      return mapChart(dark);
    case 'pie-chart':
      return pieChart(dark);
    case 'horizontal-bar-chart':
      return horizontalBarChart(dark);
    case 'ranked-bar-chart':
      return rankedBarChart(dark);
    case 'globe-chart':
      return globeChart(dark);
    default:
      return lineChart(dark);
  }
}

export const CHART_TYPE_LABELS: Record<DashboardChartType, string> = {
  'line-chart': 'Line Chart',
  'multi-line-chart': 'Area Chart',
  'dual-line-chart': 'Reach vs Impressions',
  'gauge-chart': 'Gauge Chart',
  'donut-chart': 'Donut Chart',
  'rose-chart': 'Rose Chart',
  'stacked-bar-chart': 'Stacked Bar Chart',
  'grouped-bar-chart': 'Grouped Bar Chart',
  'bar-chart': 'Bar Chart',
  'map-chart': 'Map Chart',
  'pie-chart': 'Pie Chart',
  'horizontal-bar-chart': 'Horizontal Bar Chart',
  'ranked-bar-chart': 'Ranked Bar Chart',
  'globe-chart': '🌍 Globe Chart',
};
