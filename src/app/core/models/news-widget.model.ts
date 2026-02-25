export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  fullContent: string;
  imageUrl?: string;
  sourceName: string;
  sourceFaviconUrl?: string;
  sourceUrl: string;
  publishedAt: string; // ISO string — avoids Date serialisation issues in localStorage
  category?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  engagementScore?: number;
  tags?: string[];
  author?: string;
}

export interface NewsWidgetConfig {
  widgetTitle: string;
  articles: NewsArticle[];
}
