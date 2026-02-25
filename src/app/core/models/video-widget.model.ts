export interface TranscriptLine {
  timestamp: string;    // e.g. "00:01:24"
  speaker?: string;
  text: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface VideoComment {
  id: string;
  userName: string;
  userAvatarUrl?: string;
  date: string;
  text: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  emotion?: string;     // e.g. "Happy", "Angry"
}

export interface VideoTag {
  label: string;
  category: string;     // e.g. "Public Figures", "Places", "Entities"
  subCategory?: string; // e.g. "Businessmen", "Countries"
  highlighted?: boolean;
}

export interface VideoAnalytics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  ageGroups?: { label: string; percentage: number }[];
  genderSplit?: { male: number; female: number };
  sentimentBreakdown?: { positive: number; negative: number; neutral: number };
  topRegions?: { name: string; percentage: number }[];
}

export interface VideoWidgetConfig {
  widgetTitle: string;
  videoUrl: string;           // YouTube embed URL or direct mp4
  platform: 'youtube' | 'vimeo' | 'direct';
  thumbnailUrl?: string;
  title: string;
  description?: string;
  duration: string;           // e.g. "2:31"
  channelName: string;
  channelAvatarUrl?: string;
  publishedAt: string;        // ISO string
  language?: string;          // e.g. "Arabic"
  sentiment?: 'positive' | 'negative' | 'neutral';
  transcript?: TranscriptLine[];
  tags?: VideoTag[];
  comments?: VideoComment[];
  analytics?: VideoAnalytics;
  storytelling?: string;      // AI-generated narrative summary
}
