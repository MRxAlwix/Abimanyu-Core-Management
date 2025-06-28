import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface FormValidationProps {
  errors: string[];
  className?: string;
}

export function FormValidation({ errors, className = '' }: FormValidationProps) {
  if (errors.length === 0) return null;

  return (
    <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 ${className}`}>
      <div className="flex items-start">
        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
            Terdapat kesalahan:
          </h4>
          <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="flex items-start">
                <span className="w-1 h-1 bg-red-600 dark:bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                {error}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}