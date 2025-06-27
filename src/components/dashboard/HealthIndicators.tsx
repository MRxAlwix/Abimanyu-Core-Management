import React from 'react';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface HealthIndicator {
  type: 'error' | 'warning' | 'info';
  message: string;
  action: string;
}

interface HealthIndicatorsProps {
  indicators: HealthIndicator[];
}

export function HealthIndicators({ indicators }: HealthIndicatorsProps) {
  if (indicators.length === 0) return null;

  const getIndicatorStyles = (type: HealthIndicator['type']) => {
    switch (type) {
      case 'error':
        return {
          container: 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300',
          icon: AlertCircle,
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-700 dark:text-yellow-300',
          icon: AlertTriangle,
        };
      case 'info':
        return {
          container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300',
          icon: Info,
        };
    }
  };

  return (
    <div className="space-y-2">
      {indicators.map((indicator, index) => {
        const styles = getIndicatorStyles(indicator.type);
        const Icon = styles.icon;

        return (
          <div
            key={index}
            className={`p-3 rounded-lg border-l-4 ${styles.container}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">{indicator.message}</p>
                <p className="text-sm opacity-75 mt-1">{indicator.action}</p>
              </div>
              <Icon className="w-5 h-5 flex-shrink-0 ml-3" />
            </div>
          </div>
        );
      })}
    </div>
  );
}