import { Injectable } from '@angular/core';
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Globe,
  ShoppingCart,
  DollarSign,
  Target,
  Zap,
  Heart,
  Star,
  Trophy,
  Award,
  Briefcase,
  Smartphone,
  Monitor,
  Youtube,
  Facebook,
  Instagram,
  Twitter,
  MessageCircle,
  Mail,
  Calendar,
  Clock,
  FileText,
  FolderOpen,
  Database,
  Server,
  Cloud,
  Settings,
} from 'lucide-angular';

// Type for Lucide icons
type LucideIconType = typeof LayoutDashboard;

export interface DashboardIconOption {
  id: string;
  name: string;
  icon: LucideIconType;
  category: string;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardIconService {
  private iconMap: Record<string, LucideIconType> = {
    'layout-dashboard': LayoutDashboard,
    'trending-up': TrendingUp,
    'bar-chart': BarChart3,
    'pie-chart': PieChart,
    activity: Activity,
    users: Users,
    globe: Globe,
    'shopping-cart': ShoppingCart,
    'dollar-sign': DollarSign,
    target: Target,
    zap: Zap,
    heart: Heart,
    star: Star,
    trophy: Trophy,
    award: Award,
    briefcase: Briefcase,
    smartphone: Smartphone,
    monitor: Monitor,
    youtube: Youtube,
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    'message-circle': MessageCircle,
    mail: Mail,
    calendar: Calendar,
    clock: Clock,
    'file-text': FileText,
    'folder-open': FolderOpen,
    database: Database,
    server: Server,
    cloud: Cloud,
    settings: Settings,
  };

  getIconOptions(): DashboardIconOption[] {
    return [
      // Analytics & Charts
      { id: 'layout-dashboard', name: 'Dashboard', icon: LayoutDashboard, category: 'Analytics' },
      { id: 'trending-up', name: 'Trending', icon: TrendingUp, category: 'Analytics' },
      { id: 'bar-chart', name: 'Bar Chart', icon: BarChart3, category: 'Analytics' },
      { id: 'pie-chart', name: 'Pie Chart', icon: PieChart, category: 'Analytics' },
      { id: 'activity', name: 'Activity', icon: Activity, category: 'Analytics' },

      // Social & Communication
      { id: 'users', name: 'Users', icon: Users, category: 'Social' },
      { id: 'youtube', name: 'YouTube', icon: Youtube, category: 'Social' },
      { id: 'facebook', name: 'Facebook', icon: Facebook, category: 'Social' },
      { id: 'instagram', name: 'Instagram', icon: Instagram, category: 'Social' },
      { id: 'twitter', name: 'Twitter', icon: Twitter, category: 'Social' },
      { id: 'message-circle', name: 'Messages', icon: MessageCircle, category: 'Social' },

      // Business
      { id: 'briefcase', name: 'Business', icon: Briefcase, category: 'Business' },
      { id: 'shopping-cart', name: 'E-commerce', icon: ShoppingCart, category: 'Business' },
      { id: 'dollar-sign', name: 'Finance', icon: DollarSign, category: 'Business' },
      { id: 'target', name: 'Goals', icon: Target, category: 'Business' },
      { id: 'trophy', name: 'Achievement', icon: Trophy, category: 'Business' },
      { id: 'award', name: 'Award', icon: Award, category: 'Business' },

      // Technology
      { id: 'smartphone', name: 'Mobile', icon: Smartphone, category: 'Technology' },
      { id: 'monitor', name: 'Monitor', icon: Monitor, category: 'Technology' },
      { id: 'globe', name: 'Website', icon: Globe, category: 'Technology' },
      { id: 'database', name: 'Database', icon: Database, category: 'Technology' },
      { id: 'server', name: 'Server', icon: Server, category: 'Technology' },
      { id: 'cloud', name: 'Cloud', icon: Cloud, category: 'Technology' },

      // General
      { id: 'zap', name: 'Energy', icon: Zap, category: 'General' },
      { id: 'heart', name: 'Favorite', icon: Heart, category: 'General' },
      { id: 'star', name: 'Star', icon: Star, category: 'General' },
      { id: 'mail', name: 'Email', icon: Mail, category: 'General' },
      { id: 'calendar', name: 'Calendar', icon: Calendar, category: 'General' },
      { id: 'clock', name: 'Time', icon: Clock, category: 'General' },
      { id: 'file-text', name: 'Document', icon: FileText, category: 'General' },
      { id: 'folder-open', name: 'Folder', icon: FolderOpen, category: 'General' },
      { id: 'settings', name: 'Settings', icon: Settings, category: 'General' },
    ];
  }

  getIcon(iconId: string): LucideIconType | null {
    return this.iconMap[iconId] || null;
  }

  getDefaultIconId(): string {
    return 'layout-dashboard';
  }

  // Get icon by template ID
  getTemplateIconId(templateId: string): string {
    const templateIcons: Record<string, string> = {
      blank: 'layout-dashboard',
      'social-media': 'users',
      youtube: 'youtube',
      instagram: 'instagram',
      facebook: 'facebook',
      executive: 'bar-chart',
      twitter: 'twitter',
      tiktok: 'smartphone',
    };
    return templateIcons[templateId] || this.getDefaultIconId();
  }
}
