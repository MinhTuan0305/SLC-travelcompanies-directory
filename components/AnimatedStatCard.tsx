"use client";

import CountUpAnimation from './CountUpAnimation';

interface AnimatedStatCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  description?: string;
  className?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
}

export default function AnimatedStatCard({
  title,
  value,
  suffix = '',
  prefix = '',
  description,
  className = '',
  icon,
  color = 'blue'
}: AnimatedStatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    red: 'bg-red-50 border-red-200 text-red-600',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600'
  };

  const textColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    indigo: 'text-indigo-600'
  };

  return (
    <div className={`bg-white rounded-xl shadow-luxury border border-gray-100/50 p-6 hover:shadow-luxury-hover transition-all duration-300 ${className}`}>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-luxury-navy/70 uppercase tracking-wide">
          {title}
        </h3>
        
        <div className={`text-3xl font-bold ${textColorClasses[color]}`}>
          <CountUpAnimation
            end={value}
            prefix={prefix}
            suffix={suffix}
            duration={2000}
          />
        </div>
        
        {description && (
          <p className="text-sm text-luxury-navy/60">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
