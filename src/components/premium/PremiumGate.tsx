import React from 'react';
import { Crown, Lock } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface PremiumGateProps {
  featureName: string;
  description: string;
  onUpgrade: () => void;
  children?: React.ReactNode;
}

export function PremiumGate({ featureName, description, onUpgrade, children }: PremiumGateProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10" />
      <div className="relative z-10 text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {featureName}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {description}
        </p>
        
        <div className="flex items-center justify-center mb-6">
          <Lock className="w-4 h-4 text-yellow-600 mr-2" />
          <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
            Fitur Premium
          </span>
        </div>
        
        <Button
          onClick={onUpgrade}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          icon={Crown}
        >
          Upgrade ke Premium
        </Button>
        
        {children}
      </div>
    </Card>
  );
}