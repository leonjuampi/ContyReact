
import Card from '../base/Card';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  iconColor?: string;
}

export default function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon,
  iconColor = 'text-gray-600'
}: MetricCardProps) {
  const changeColors = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-500 dark:text-gray-400'
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            {change && (
              <span className={`text-sm font-medium ${changeColors[changeType]}`}>
                {change}
              </span>
            )}
          </div>
        </div>
        <div className={`w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${iconColor}`}>
          <div className="w-6 h-6 flex items-center justify-center">
            <i className={`${icon} text-xl`}></i>
          </div>
        </div>
      </div>
    </Card>
  );
}
