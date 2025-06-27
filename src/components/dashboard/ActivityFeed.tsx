import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  QrCode, 
  Users,
  Package,
  MapPin,
  FileText
} from 'lucide-react';
import { Card } from '../ui/Card';

interface Activity {
  id: string;
  type: string;
  action: string;
  subject: string;
  time: string;
  icon: string;
  color: string;
  amount?: number;
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

export function ActivityFeed({ activities, maxItems = 8 }: ActivityFeedProps) {
  const getIcon = (iconName: string) => {
    const icons = {
      DollarSign,
      TrendingUp,
      TrendingDown,
      Clock,
      QrCode,
      Users,
      Package,
      MapPin,
      FileText,
    };
    return icons[iconName as keyof typeof icons] || FileText;
  };

  const getColorClasses = (color: string) => {
    const colors = {
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
      indigo: 'bg-indigo-500',
      teal: 'bg-teal-500',
      pink: 'bg-pink-500',
    };
    return colors[color as keyof typeof colors] || 'bg-gray-500';
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
    
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const displayedActivities = activities.slice(0, maxItems);

  if (displayedActivities.length === 0) {
    return (
      <Card title="Aktivitas Terbaru">
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Belum ada aktivitas
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Aktivitas Terbaru">
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {displayedActivities.map((activity) => {
          const Icon = getIcon(activity.icon);
          const colorClass = getColorClasses(activity.color);

          return (
            <div 
              key={activity.id} 
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {activity.action}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {activity.subject}
                </p>
                {activity.amount && (
                  <p className="text-xs font-medium text-green-600 dark:text-green-400">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(activity.amount)}
                  </p>
                )}
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {formatTimeAgo(activity.time)}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}